import { randomUUID } from 'node:crypto';
import type { DocumentTypeKey, SubjectType } from '../document-types/define';
import { DocumentError } from '../errors';
import type { Actor, IssuedDocument, IssuingTx, NewOutboxEntry, PolicyStep } from '../ports';
import {
  getPolicyFunction,
  type ActionFunctionName,
  type CheckFunctionName,
  type PolicyArgs,
  type RefusalOf,
} from './catalog';
import type { ActionEvent, CheckEvent, RefusalCode } from './define';

/** What a before… function sees. It runs inside the transaction, after the subject lock. */
export interface PolicyCheckContext<Tx extends IssuingTx = IssuingTx, A = unknown> {
  event: CheckEvent;
  args: A;
  tx: Tx;
  actor: Actor;
  documentType: DocumentTypeKey;
  schoolId: string;
  subSchoolId: string;
  subject: { type: SubjectType; id: string } | null;
  /** beforeIssue: the validated params (studentId, academicPeriodId…). Null on beforeRevoke. */
  params: Record<string, unknown> | null;
  /** beforeIssue: the validated payload the document will print. Null on beforeRevoke. */
  payload: unknown;
  /** beforeRevoke: the document being revoked. Null on beforeIssue. */
  document: IssuedDocument | null;
  /** beforeIssue of a correction: the document it replaces. */
  replacesId: string | null;
  /** The calendar day in the school's time zone (yyyy-mm-dd). */
  today: string;
  now: Date;
}

export type PolicyCheckResult<R extends RefusalCode = RefusalCode> =
  | undefined
  | { refuse: R; message: string };

/** What an after… function sees. It runs in the worker, maybe several times. */
export interface PolicyActionContext<A = unknown> {
  event: ActionEvent;
  args: A;
  document: IssuedDocument;
  /** The outbox entry id: the same action run twice must have the effect of one. */
  idempotencyKey: string;
  /** 1 on the first run. */
  attempt: number;
}

export type CheckImplementation<Tx extends IssuingTx, N extends CheckFunctionName> = (
  ctx: PolicyCheckContext<Tx, PolicyArgs<N>>,
) => Promise<PolicyCheckResult<RefusalOf<N>>>;

export type ActionImplementation<N extends ActionFunctionName> = (
  ctx: PolicyActionContext<PolicyArgs<N>>,
) => Promise<void>;

/** What a function does. The backend gives those that read its tables. */
export type PolicyImplementations<Tx extends IssuingTx = IssuingTx> = {
  [N in CheckFunctionName]?: CheckImplementation<Tx, N>;
} & { [N in ActionFunctionName]?: ActionImplementation<N> };

type AnyCheck = (ctx: PolicyCheckContext<IssuingTx, unknown>) => Promise<PolicyCheckResult>;
type AnyAction = (ctx: PolicyActionContext) => Promise<void>;

/** Runs the steps of a policy version against the implementations. */
export class PolicyRunner<Tx extends IssuingTx = IssuingTx> {
  private readonly implementations: Record<string, unknown>;

  constructor(implementations: PolicyImplementations<Tx>) {
    this.implementations = { ...implementations };
  }

  /** Names of the functions this deployment can run: a policy may only use these. */
  implemented(): Set<string> {
    return new Set(Object.keys(this.implementations).filter((k) => this.implementations[k]));
  }

  private implementation(name: string): unknown {
    const found = this.implementations[name];
    if (!found) throw new Error(`Policy function ${name} has no implementation`);
    return found;
  }

  /**
   * The steps of this event, in order. The first refusal throws its code and
   * stops everything: the transaction rolls back.
   */
  async check(
    steps: readonly PolicyStep[],
    event: CheckEvent,
    ctx: Omit<PolicyCheckContext<Tx>, 'event' | 'args'>,
  ): Promise<void> {
    for (const [index, step] of steps.entries()) {
      if (step.on !== event) continue;
      const definition = getPolicyFunction(step.fn);
      if (definition?.kind !== 'check') throw new Error(`${step.fn} is not a check`);
      const run = this.implementation(step.fn) as AnyCheck;
      const args = definition.args.parse(step.args ?? {});
      const result = await run({ ...ctx, event, args } as PolicyCheckContext);
      if (!result) continue;
      if (!(definition.refusals as readonly string[]).includes(result.refuse)) {
        throw new Error(`${step.fn} refused with ${result.refuse}, which it does not declare`);
      }
      throw new DocumentError(result.refuse, result.message, [
        { code: result.refuse, path: `steps.${index}`, message: `${step.fn}: ${result.message}` },
      ]);
    }
  }

  /** The outbox entries of this event, written in the transaction of the document. */
  actions(
    steps: readonly PolicyStep[],
    event: ActionEvent,
    document: Pick<IssuedDocument, 'id' | 'schoolId'>,
    at: Date,
  ): NewOutboxEntry[] {
    return steps
      .filter((step) => step.on === event)
      .map((step) => ({
        id: randomUUID(),
        schoolId: document.schoolId,
        issuedDocumentId: document.id,
        event,
        fn: step.fn,
        args: step.args ?? {},
        nextAttemptAt: at,
      }));
  }

  /** Runs one outbox entry. Throws when the action failed and must be retried. */
  async act(ctx: PolicyActionContext & { fn: string }): Promise<void> {
    const definition = getPolicyFunction(ctx.fn);
    if (definition?.kind !== 'action') throw new Error(`${ctx.fn} is not an action`);
    const run = this.implementation(ctx.fn) as AnyAction;
    const { fn: _fn, ...rest } = ctx;
    await run({ ...rest, args: definition.args.parse(ctx.args ?? {}) });
  }
}
