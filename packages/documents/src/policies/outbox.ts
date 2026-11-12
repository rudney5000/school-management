import { DocumentError } from '../errors';
import type {
  Actor,
  IssuedDocumentStore,
  OutboxEntry,
  OutboxFilter,
  OutboxOutcome,
  OutboxStore,
} from '../ports';
import { canAccess } from '../templates/template-service';
import type { PolicyRunner } from './runtime';

/** After this many failed runs, the entry stops being retried: `failed`, retried by hand. */
export const MAX_ATTEMPTS = 8;

/** Wait after the 1st, 2nd… failure: 1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h. */
export const RETRY_DELAYS_MS = [1, 5, 30, 120, 360, 720, 1440].map((minutes) => minutes * 60_000);

/** What happens after a run: done, a later try, or failed for good. */
export function outcomeOf(
  attempts: number,
  error: unknown,
  now: Date,
): Exclude<OutboxOutcome, { status: 'done' }> {
  const message = (error instanceof Error ? error.message : String(error)).slice(0, 2000);
  if (attempts >= MAX_ATTEMPTS) return { status: 'failed', attempts, error: message };
  const delay = RETRY_DELAYS_MS[Math.min(attempts, RETRY_DELAYS_MS.length) - 1]!;
  return {
    status: 'pending',
    attempts,
    nextAttemptAt: new Date(now.getTime() + delay),
    error: message,
  };
}

export interface OutboxWorkerDeps {
  outbox: OutboxStore;
  issued: Pick<IssuedDocumentStore, 'findById'>;
  runner: Pick<PolicyRunner, 'act'>;
  now: () => Date;
  /** An action failed (entry), or the worker itself could not run (null). */
  onError?: (error: unknown, entry: OutboxEntry | null) => void;
}

/**
 * Runs the after… actions written by the issuing transactions. Several
 * workers may run at once: each entry is locked by the one that took it.
 */
export class OutboxWorker {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<number> | null = null;

  constructor(private readonly deps: OutboxWorkerDeps) {}

  private async run(entry: OutboxEntry): Promise<OutboxOutcome> {
    const attempts = entry.attempts + 1;
    try {
      const document = await this.deps.issued.findById(entry.issuedDocumentId);
      if (!document) throw new Error(`Document ${entry.issuedDocumentId} not found`);
      await this.deps.runner.act({
        fn: entry.fn,
        event: entry.event as 'afterIssue' | 'afterRevoke',
        args: entry.args,
        document,
        idempotencyKey: entry.id,
        attempt: attempts,
      });
      return { status: 'done', attempts, at: this.deps.now() };
    } catch (error) {
      this.deps.onError?.(error, entry);
      return outcomeOf(attempts, error, this.deps.now());
    }
  }

  /** Processes the due entries one by one, at most `limit`. Returns how many ran. */
  async runOnce(limit = 50): Promise<number> {
    let count = 0;
    while (count < limit) {
      const entry = await this.deps.outbox.processNext(this.deps.now(), (e) => this.run(e));
      if (!entry) break;
      count++;
    }
    return count;
  }

  /** Every `intervalMs`, without overlapping runs. */
  start(intervalMs = 5_000): void {
    if (this.timer) return;
    const tick = async () => {
      try {
        this.running = this.runOnce();
        await this.running;
      } catch (error) {
        this.deps.onError?.(error, null);
      } finally {
        this.running = null;
        if (this.timer) this.timer = setTimeout(tick, intervalMs);
      }
    };
    this.timer = setTimeout(tick, intervalMs);
  }

  /** Waits for the run in progress. */
  async stop(): Promise<void> {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    await this.running?.catch(() => undefined);
  }
}

/** What the back-office sees of the outbox: the failed actions, and a button to retry them. */
export class OutboxService {
  constructor(private readonly deps: { outbox: OutboxStore; now: () => Date }) {}

  async list(actor: Actor, schoolId: string, filter: Omit<OutboxFilter, 'schoolId'>) {
    if (!canAccess(actor, schoolId)) return [];
    return this.deps.outbox.list({ ...filter, schoolId });
  }

  async retry(actor: Actor, id: string): Promise<OutboxEntry> {
    const entry = await this.deps.outbox.findById(id);
    if (!entry || !canAccess(actor, entry.schoolId)) {
      throw new DocumentError('NOT_FOUND', `Outbox entry ${id} not found`);
    }
    if (entry.status !== 'failed') {
      throw new DocumentError('CONFLICT', 'Only a failed action can be retried');
    }
    await this.deps.outbox.retry(id, this.deps.now());
    return (await this.deps.outbox.findById(id))!;
  }
}
