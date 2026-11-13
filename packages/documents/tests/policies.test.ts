import { describe, expect, it } from 'vitest';
import {
  DocumentError,
  MAX_ATTEMPTS,
  POLICY_FUNCTIONS,
  RETRY_DELAYS_MS,
  validatePolicySteps,
  type Actor,
  type PolicyImplementations,
  type PolicyStep,
} from '../src';
import {
  director,
  fakeRenderer,
  gombeScope,
  params,
  publishedGroupTemplate,
  setup,
  team,
} from './helpers';

const ALL = new Set(Object.keys(POLICY_FUNCTIONS));
const check = (steps: unknown, documentType: 'bulletin' | 'free' = 'bulletin', implemented = ALL) =>
  validatePolicySteps(steps, { documentType, implemented });
const codes = (steps: unknown, documentType: 'bulletin' | 'free' = 'bulletin') =>
  check(steps, documentType).issues.map((i) => `${i.code} ${i.path}`);

const admin: Actor = { ...director, userId: 'user-admin', role: 'admin' };
const directorWithRole: Actor = { ...director, role: 'director' };

/** Stand-ins for the functions the backend implements, recording what they saw. */
function fakeFunctions(state: { due: number; failures?: number }) {
  const published: { key: string; attempt: number; documentId: string }[] = [];
  const functions: PolicyImplementations = {
    requireFeesPaid: async ({ args }) =>
      state.due > args.toleranceFc
        ? { refuse: 'FEES_UNPAID', message: `${state.due} FC still due` }
        : undefined,
    requireAllGrades: async () => undefined,
    requireAttendance: async () => undefined,
    publishToParentPortal: async ({ idempotencyKey, attempt, document }) => {
      if ((state.failures ?? 0) >= attempt) throw new Error(`portal down (${attempt})`);
      published.push({ key: idempotencyKey, attempt, documentId: document.id });
    },
  };
  return { functions, published };
}

async function withPolicy(
  steps: PolicyStep[],
  state = { due: 0 } as { due: number; failures?: number },
) {
  const fake = fakeFunctions(state);
  let clock = new Date('2025-12-19T10:00:00Z');
  const ctx = setup({
    renderer: fakeRenderer().renderer,
    policyFunctions: fake.functions,
    now: () => clock,
  });
  await publishedGroupTemplate(ctx);
  const policy = await ctx.policies.create(team, {
    scope: { schoolId: gombeScope.schoolId, subSchoolId: null },
    documentType: 'bulletin',
    steps,
  });
  await ctx.policies.publish(team, policy.id, 'v1');
  return {
    ...ctx,
    ...fake,
    policy,
    advance: (ms: number) => (clock = new Date(clock.getTime() + ms)),
    at: (date: Date) => (clock = date),
    issueFor: (p = params(), actor: Actor = directorWithRole, extra: object = {}) =>
      ctx.issuing.issue({ type: 'bulletin', scope: gombeScope, params: p, actor, ...extra }),
  };
}

describe('policy validation', () => {
  it('accepts catalogue steps and fills the default args', () => {
    const result = check([
      { on: 'beforeIssue', fn: 'requireFeesPaid', args: { upTo: 'period' } },
      { on: 'beforeIssue', fn: 'oncePerSubject' },
      { on: 'beforeRevoke', fn: 'requireRole', args: { roles: ['director'] } },
      { on: 'afterIssue', fn: 'publishToParentPortal' },
    ]);
    expect(result.issues).toEqual([]);
    expect(result.steps[0]!.args).toEqual({ upTo: 'period', toleranceFc: 0 });
    expect(result.steps[1]!.args).toEqual({ per: 'period' });
  });

  it('refuses a function outside the catalogue, or not implemented here', () => {
    expect(codes([{ on: 'beforeIssue', fn: 'sendFax' }])).toEqual(['UNKNOWN_FUNCTION steps.0.fn']);
    expect(codes([{ on: 'beforeIssue', fn: 'toString' }])).toEqual(['UNKNOWN_FUNCTION steps.0.fn']);
    const partial = check(
      [{ on: 'afterIssue', fn: 'publishToParentPortal' }],
      'bulletin',
      new Set(),
    );
    expect(partial.issues[0]).toMatchObject({ code: 'UNKNOWN_FUNCTION', message: /not available/ });
  });

  it('refuses a function on an event it does not run on', () => {
    expect(codes([{ on: 'beforeIssue', fn: 'publishToParentPortal' }])).toEqual([
      'EVENT_NOT_ALLOWED steps.0.on',
    ]);
    expect(codes([{ on: 'afterIssue', fn: 'requireFeesPaid', args: { upTo: 'year' } }])).toEqual([
      'EVENT_NOT_ALLOWED steps.0.on',
    ]);
    expect(codes([{ on: 'whenever', fn: 'requireAllGrades' }])).toEqual([
      'EVENT_NOT_ALLOWED steps.0.on',
    ]);
  });

  it('refuses missing, extra or malformed args', () => {
    expect(codes([{ on: 'beforeIssue', fn: 'requireFeesPaid' }])).toEqual([
      'INVALID_ARGS steps.0.args.upTo',
    ]);
    expect(codes([{ on: 'beforeIssue', fn: 'requireAllGrades', args: { strict: true } }])).toEqual([
      'INVALID_ARGS steps.0.args',
    ]);
    expect(
      codes([{ on: 'beforeIssue', fn: 'requireAttendance', args: { minPercent: 140 } }]),
    ).toEqual(['INVALID_ARGS steps.0.args.minPercent']);
    expect(codes([{ on: 'beforeIssue', fn: 'requireRole', args: { roles: ['janitor'] } }])).toEqual(
      ['INVALID_ARGS steps.0.args.roles.0'],
    );
  });

  it('refuses more than 20 steps', () => {
    const steps = Array.from({ length: 21 }, () => ({ on: 'beforeIssue', fn: 'requireAllGrades' }));
    expect(codes(steps)).toEqual(['TOO_MANY_STEPS steps']);
  });

  it('refuses a function that needs a subject the type does not have', () => {
    expect(codes([{ on: 'beforeIssue', fn: 'requireAllGrades' }], 'free')).toEqual([
      'FUNCTION_NOT_ALLOWED steps.0.fn',
    ]);
    // requireRole needs no subject.
    expect(
      codes([{ on: 'beforeIssue', fn: 'requireRole', args: { roles: ['admin'] } }], 'free'),
    ).toEqual([]);
  });

  it('refuses a malformed list of steps', () => {
    expect(codes('requireAllGrades')).toEqual(['INVALID_POLICY steps']);
    expect(codes([42, { on: 'beforeIssue', fn: 'requireAllGrades', when: 'always' }])).toEqual([
      'INVALID_POLICY steps.0',
      'INVALID_POLICY steps.1',
    ]);
  });
});

describe('PolicyService', () => {
  it('publishes versions, and an invalid draft is refused with every issue', async () => {
    const ctx = setup();
    const scope = { schoolId: gombeScope.schoolId, subSchoolId: null };
    await expect(
      ctx.policies.create(team, {
        scope,
        documentType: 'bulletin',
        steps: [
          { on: 'beforeIssue', fn: 'nope' },
          { on: 'afterIssue', fn: 'requireRole' },
        ],
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_POLICY',
      issues: [{ code: 'UNKNOWN_FUNCTION' }, { code: 'EVENT_NOT_ALLOWED' }],
    });

    const policy = await ctx.policies.create(team, {
      scope,
      documentType: 'bulletin',
      steps: [{ on: 'beforeIssue', fn: 'oncePerSubject' }],
    });
    expect(await ctx.policies.resolve(gombeScope, 'bulletin')).toBeNull();
    const v1 = await ctx.policies.publish(team, policy.id);
    await ctx.policies.saveDraft(team, policy.id, []);
    const v2 = await ctx.policies.publish(team, policy.id);
    expect([v1.version, v2.version]).toEqual([1, 2]);
    expect((await ctx.policies.resolve(gombeScope, 'bulletin'))!.version.steps).toEqual([]);
    await ctx.policies.activate(team, policy.id, 1);
    expect((await ctx.policies.resolve(gombeScope, 'bulletin'))!.version.steps).toHaveLength(1);

    await expect(
      ctx.policies.create(team, { scope, documentType: 'bulletin', steps: [] }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it("uses the sub-school's policy before the group's, and falls back when it is archived", async () => {
    const ctx = setup();
    const group = await ctx.policies.create(team, {
      scope: { schoolId: gombeScope.schoolId, subSchoolId: null },
      documentType: 'bulletin',
      steps: [],
    });
    await ctx.policies.publish(team, group.id);
    const own = await ctx.policies.create(team, {
      scope: { schoolId: gombeScope.schoolId, subSchoolId: gombeScope.subSchoolId },
      documentType: 'bulletin',
      steps: [{ on: 'beforeIssue', fn: 'oncePerSubject' }],
    });
    await ctx.policies.publish(team, own.id);
    expect((await ctx.policies.resolve(gombeScope, 'bulletin'))!.policy.id).toBe(own.id);
    await ctx.policies.archive(team, own.id);
    expect((await ctx.policies.resolve(gombeScope, 'bulletin'))!.policy.id).toBe(group.id);
  });

  it('hides the policies of another school', async () => {
    const ctx = setup();
    const policy = await ctx.policies.create(team, {
      scope: { schoolId: gombeScope.schoolId, subSchoolId: null },
      documentType: 'bulletin',
      steps: [],
    });
    const stranger: Actor = { userId: 'x', schoolId: 'another-school' };
    await expect(ctx.policies.find(stranger, policy.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(await ctx.policies.list(stranger, gombeScope.schoolId)).toEqual([]);
  });

  it('lists the catalogue with what this deployment implements', () => {
    const ctx = setup();
    const functions = ctx.policies.functions();
    expect(functions.map((f) => f.name)).toEqual(Object.keys(POLICY_FUNCTIONS));
    expect(functions.find((f) => f.name === 'requireRole')!.available).toBe(true);
    expect(functions.find((f) => f.name === 'requireFeesPaid')!.available).toBe(false);
  });
});

describe('issuing with a policy', () => {
  it('refuses with the code of the first failing step, takes no number and writes no action', async () => {
    const state = { due: 5000 };
    const ctx = await withPolicy(
      [
        { on: 'beforeIssue', fn: 'requireFeesPaid', args: { upTo: 'period', toleranceFc: 1000 } },
        { on: 'afterIssue', fn: 'publishToParentPortal' },
      ],
      state,
    );
    const refused = await ctx.issueFor().catch((e: unknown) => e);
    expect(refused).toBeInstanceOf(DocumentError);
    expect(refused).toMatchObject({ code: 'FEES_UNPAID', issues: [{ path: 'steps.0' }] });
    expect(ctx.issued.documents.size).toBe(0);
    expect(ctx.outboxStore.entries.size).toBe(0);
    expect(ctx.files.files.size).toBe(0);

    state.due = 500;
    const doc = await ctx.issueFor();
    expect(doc.number).toBe('SJG-BUL-2025-2026-000001');
    expect(doc).toMatchObject({ policyId: ctx.policy.id, policyVersion: 1 });
  });

  it('writes the after… actions with the document', async () => {
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
    const doc = await ctx.issueFor();
    const [entry] = [...ctx.outboxStore.entries.values()];
    expect(entry).toMatchObject({
      issuedDocumentId: doc.id,
      schoolId: doc.schoolId,
      event: 'afterIssue',
      fn: 'publishToParentPortal',
      status: 'pending',
      attempts: 0,
    });
    expect(ctx.published).toEqual([]);
  });

  it('rolls the actions back with the document when the issue fails late', async () => {
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
    ctx.files.put = async () => {
      throw new Error('S3 is down');
    };
    await expect(ctx.issueFor()).rejects.toThrow('S3 is down');
    expect(ctx.issued.documents.size).toBe(0);
    expect(ctx.outboxStore.entries.size).toBe(0);
  });

  it('requireRole refuses issuing and revoking to the roles it does not list', async () => {
    const ctx = await withPolicy([
      { on: 'beforeIssue', fn: 'requireRole', args: { roles: ['director', 'admin'] } },
      { on: 'beforeRevoke', fn: 'requireRole', args: { roles: ['director'] } },
    ]);
    const doc = await ctx.issueFor(params(), admin);
    await expect(ctx.issueFor(params(), director)).rejects.toMatchObject({
      code: 'ROLE_NOT_ALLOWED',
    });

    await expect(ctx.issuing.revoke(admin, doc.id, 'erreur')).rejects.toMatchObject({
      code: 'ROLE_NOT_ALLOWED',
    });
    expect((await ctx.issuing.find(admin, doc.id)).status).toBe('issued');
    await ctx.issuing.revoke(directorWithRole, doc.id, 'erreur');
    expect((await ctx.issuing.find(admin, doc.id)).status).toBe('revoked');
  });

  it('oncePerSubject refuses a second bulletin of the period, not a correction', async () => {
    const ctx = await withPolicy([{ on: 'beforeIssue', fn: 'oncePerSubject' }]);
    const p = params();
    const first = await ctx.issueFor(p);
    await expect(ctx.issueFor(p)).rejects.toMatchObject({
      code: 'ALREADY_ISSUED',
      message: expect.stringContaining(first.number),
    });
    // Another student is not concerned.
    await ctx.issueFor();

    const correction = await ctx.issueFor(p, directorWithRole, {
      replaces: { id: first.id, reason: 'Note corrigée' },
    });
    expect(correction.replacesId).toBe(first.id);
    await expect(ctx.issueFor(p)).rejects.toMatchObject({ code: 'ALREADY_ISSUED' });
  });

  it('oncePerSubject per month lets the next month through', async () => {
    const ctx = await withPolicy([
      { on: 'beforeIssue', fn: 'oncePerSubject', args: { per: 'month' } },
    ]);
    const p = params();
    await ctx.issueFor(p);
    await expect(ctx.issueFor(p)).rejects.toMatchObject({ code: 'ALREADY_ISSUED' });
    ctx.advance(20 * 24 * 3600_000);
    await ctx.issueFor(p);
  });

  it('a function refusing with a code it does not declare is a bug, not a refusal', async () => {
    const ctx = setup({
      policyFunctions: {
        requireAllGrades: async () => ({ refuse: 'FEES_UNPAID' as never, message: 'oops' }),
      },
    });
    await publishedGroupTemplate(ctx);
    const policy = await ctx.policies.create(team, {
      scope: { schoolId: gombeScope.schoolId, subSchoolId: null },
      documentType: 'bulletin',
      steps: [{ on: 'beforeIssue', fn: 'requireAllGrades' }],
    });
    await ctx.policies.publish(team, policy.id);
    const error = await ctx.issuing
      .issue({ type: 'bulletin', scope: gombeScope, params: params(), actor: director })
      .catch((e: unknown) => e);
    expect(error).not.toBeInstanceOf(DocumentError);
    expect(String(error)).toMatch(/does not declare/);
  });
});

describe('outbox worker', () => {
  it('runs an action once, with the entry id as idempotency key', async () => {
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
    const doc = await ctx.issueFor();
    expect(await ctx.worker.runOnce()).toBe(1);
    const [entry] = [...ctx.outboxStore.entries.values()];
    expect(ctx.published).toEqual([{ key: entry!.id, attempt: 1, documentId: doc.id }]);
    expect(entry).toMatchObject({ status: 'done', attempts: 1 });
    expect(entry!.doneAt).toBeInstanceOf(Date);
    expect(await ctx.worker.runOnce()).toBe(0);
  });

  it('retries later and later, then marks the entry failed after 8 attempts', async () => {
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }], {
      due: 0,
      failures: 99,
    });
    await ctx.issueFor();
    const [entry] = [...ctx.outboxStore.entries.values()];
    const waits: number[] = [];
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const due = ctx.outboxStore.entries.get(entry!.id)!.nextAttemptAt;
      ctx.at(new Date(due.getTime() - 1));
      if (attempt > 1) expect(await ctx.worker.runOnce()).toBe(0);
      ctx.at(due);
      expect(await ctx.worker.runOnce()).toBe(1);
      const after = ctx.outboxStore.entries.get(entry!.id)!;
      expect(after.attempts).toBe(attempt);
      expect(after.lastError).toBe(`portal down (${attempt})`);
      if (attempt < MAX_ATTEMPTS) {
        expect(after.status).toBe('pending');
        waits.push(after.nextAttemptAt.getTime() - due.getTime());
      } else {
        expect(after.status).toBe('failed');
      }
    }
    expect(waits).toEqual(RETRY_DELAYS_MS);
    ctx.advance(30 * 24 * 3600_000);
    expect(await ctx.worker.runOnce()).toBe(0);
  });

  it('a failed action is retried by hand, with its attempts reset', async () => {
    const state = { due: 0, failures: 99 };
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }], state);
    await ctx.issueFor();
    const [entry] = [...ctx.outboxStore.entries.values()];
    Object.assign(ctx.outboxStore.entries.get(entry!.id)!, {
      status: 'failed',
      attempts: MAX_ATTEMPTS,
    });
    const failed = await ctx.outbox.list(team, gombeScope.schoolId, { status: 'failed' });
    expect(failed.map((e) => e.id)).toEqual([entry!.id]);
    expect(
      await ctx.outbox.list({ userId: 'x', schoolId: 'another' }, gombeScope.schoolId, {}),
    ).toEqual([]);

    expect(await ctx.outbox.retry(team, entry!.id)).toMatchObject({
      status: 'pending',
      attempts: 0,
    });
    state.failures = 0;
    expect(await ctx.worker.runOnce()).toBe(1);
    expect(ctx.outboxStore.entries.get(entry!.id)).toMatchObject({ status: 'done', attempts: 1 });
    await expect(ctx.outbox.retry(team, entry!.id)).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('two workers never take the same entry', async () => {
    const ctx = await withPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
    for (let i = 0; i < 5; i++) await ctx.issueFor();
    const [a, b] = await Promise.all([ctx.worker.runOnce(), ctx.worker.runOnce()]);
    expect(a + b).toBe(5);
    expect(new Set(ctx.published.map((p) => p.key)).size).toBe(5);
    expect(ctx.published).toHaveLength(5);
  });
});
