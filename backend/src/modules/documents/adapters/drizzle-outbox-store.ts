import { and, asc, desc, eq, lte, type SQL } from 'drizzle-orm';
import {
  DocumentError,
  type OutboxEntry,
  type OutboxFilter,
  type OutboxOutcome,
  type OutboxStore,
} from '@school-hub/documents';
import { db } from '@/db';
import { documentOutbox } from '@/db/schema';

type OutboxRow = typeof documentOutbox.$inferSelect;

const toEntry = (row: OutboxRow): OutboxEntry => ({
  ...row,
  args: row.args as Record<string, unknown>,
});

export class DrizzleOutboxStore implements OutboxStore {
  /**
   * The row stays locked while the action runs: another worker skips it
   * (SKIP LOCKED) and takes the next one. If this process dies mid-action,
   * the rollback leaves the row pending, with its attempts unchanged.
   */
  async processNext(now: Date, work: (entry: OutboxEntry) => Promise<OutboxOutcome>) {
    return db.transaction(async (tx) => {
      const [row] = await tx
        .select()
        .from(documentOutbox)
        .where(and(eq(documentOutbox.status, 'pending'), lte(documentOutbox.nextAttemptAt, now)))
        .orderBy(asc(documentOutbox.nextAttemptAt))
        .limit(1)
        .for('update', { skipLocked: true });
      if (!row) return null;

      const outcome = await work(toEntry(row));
      const patch =
        outcome.status === 'done'
          ? { status: outcome.status, attempts: outcome.attempts, doneAt: outcome.at }
          : outcome.status === 'pending'
            ? {
                status: outcome.status,
                attempts: outcome.attempts,
                nextAttemptAt: outcome.nextAttemptAt,
                lastError: outcome.error,
              }
            : { status: outcome.status, attempts: outcome.attempts, lastError: outcome.error };
      const [updated] = await tx
        .update(documentOutbox)
        .set(patch)
        .where(eq(documentOutbox.id, row.id))
        .returning();
      return toEntry(updated!);
    });
  }

  async findById(id: string) {
    const [row] = await db.select().from(documentOutbox).where(eq(documentOutbox.id, id));
    return row ? toEntry(row) : null;
  }

  async list(filter: OutboxFilter) {
    const conditions: SQL[] = [];
    if (filter.schoolId) conditions.push(eq(documentOutbox.schoolId, filter.schoolId));
    if (filter.status) conditions.push(eq(documentOutbox.status, filter.status));
    if (filter.issuedDocumentId) {
      conditions.push(eq(documentOutbox.issuedDocumentId, filter.issuedDocumentId));
    }
    const query = db
      .select()
      .from(documentOutbox)
      .where(and(...conditions))
      .orderBy(desc(documentOutbox.createdAt));
    const rows = filter.limit === undefined ? await query : await query.limit(filter.limit);
    return rows.map(toEntry);
  }

  async retry(id: string, now: Date) {
    const updated = await db
      .update(documentOutbox)
      .set({ status: 'pending', attempts: 0, nextAttemptAt: now })
      .where(and(eq(documentOutbox.id, id), eq(documentOutbox.status, 'failed')))
      .returning({ id: documentOutbox.id });
    if (updated.length === 0) {
      throw new DocumentError('CONFLICT', 'Only a failed action can be retried');
    }
  }
}
