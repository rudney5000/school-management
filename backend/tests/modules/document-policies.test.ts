import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { eq, sql } from 'drizzle-orm';
import {
  OutboxWorker,
  PAYMENT_TYPES,
  USER_ROLES,
  type DocumentsConfig,
  type PolicyStep,
} from '@school-hub/documents';
import { createApp } from '@/app';
import { db } from '@/db';
import {
  documentNumberSequences,
  documentOutbox,
  documentParentShares,
  grades,
  issuedDocuments,
  payments,
  paymentTypeEnum,
  roleEnum,
  studentAttendances,
} from '@/db/schema';
import {
  DrizzleIssuedDocumentStore,
  DrizzleIssuingTx,
} from '@/modules/documents/adapters/drizzle-issued-store';
import { DrizzleOutboxStore } from '@/modules/documents/adapters/drizzle-outbox-store';
import { configureDocuments, getDocuments } from '@/modules/documents/documents.module';
import { policyFunctions } from '@/modules/documents/policies/policy-functions';
import { bearer } from '../setup/auth';
import {
  MemoryFiles,
  classWithGrades,
  directorOf,
  issueBody,
  publishedStarter,
} from '../setup/documents';
import {
  createAdminIn,
  createParent,
  createTenant,
  linkParentToStudent,
  type Tenant,
} from '../setup/factories';

const app = createApp();

let files: MemoryFiles;
let clock: Date;

function configure(extra: Partial<DocumentsConfig<DrizzleIssuingTx>> = {}) {
  configureDocuments({
    files,
    verifyBaseUrl: 'https://app.example.org',
    // Issues and the worker read this clock, so a test moves time forward by hand.
    now: () => clock,
    ...extra,
  });
}

beforeEach(() => {
  files = new MemoryFiles();
  clock = new Date();
  configure();
});

afterAll(() => configureDocuments({}));

const count = async (
  table: typeof issuedDocuments | typeof documentOutbox | typeof documentNumberSequences,
) => {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
  return row!.n;
};

describe('document policies', () => {
  let tenant: Tenant;
  let director: string;
  let data: Awaited<ReturnType<typeof classWithGrades>>;

  beforeEach(async () => {
    tenant = await createTenant();
    director = await directorOf(tenant);
    await publishedStarter(director);
    data = await classWithGrades(tenant);
  });

  async function publishPolicy(steps: PolicyStep[], token = director) {
    const created = await request(app)
      .post('/api/documents/policies')
      .set('Authorization', token)
      .send({ documentType: 'bulletin', steps })
      .expect(201);
    const id = created.body.data.id as string;
    await request(app)
      .post(`/api/documents/policies/${id}/publish`)
      .set('Authorization', token)
      .send({ note: 'v1' })
      .expect(201);
    return id;
  }

  const issue = (body: object = issueBody(data), token = director) =>
    request(app).post('/api/documents/issued').set('Authorization', token).send(body);

  describe('routes', () => {
    it('lists the catalogue with what this backend implements', async () => {
      const res = await request(app)
        .get('/api/documents/policy-functions')
        .set('Authorization', director)
        .expect(200);
      const names = res.body.data.map((f: { name: string; available: boolean }) => [
        f.name,
        f.available,
      ]);
      expect(names).toEqual([
        ['requireFeesPaid', true],
        ['requireAllGrades', true],
        ['requireAttendance', true],
        ['oncePerSubject', true],
        ['requireRole', true],
        ['publishToParentPortal', true],
      ]);
    });

    it('reports every problem of a policy, step by step', async () => {
      const res = await request(app)
        .post('/api/documents/policies')
        .set('Authorization', director)
        .send({
          documentType: 'bulletin',
          steps: [
            { on: 'beforeIssue', fn: 'sendFax' },
            { on: 'beforeIssue', fn: 'publishToParentPortal' },
            { on: 'beforeIssue', fn: 'requireFeesPaid', args: { upTo: 'decade' } },
          ],
        })
        .expect(400);
      expect(res.body.error.code).toBe('INVALID_POLICY');
      expect(res.body.error.details).toEqual({
        'steps.0.fn': [expect.stringMatching(/^UNKNOWN_FUNCTION/)],
        'steps.1.on': [expect.stringMatching(/^EVENT_NOT_ALLOWED/)],
        'steps.2.args.upTo': [expect.stringMatching(/^INVALID_ARGS/)],
      });

      const many = Array.from({ length: 21 }, () => ({ on: 'beforeIssue', fn: 'oncePerSubject' }));
      const tooMany = await request(app)
        .post('/api/documents/policies')
        .set('Authorization', director)
        .send({ documentType: 'bulletin', steps: many })
        .expect(400);
      expect(tooMany.body.error.details.steps).toEqual([expect.stringMatching(/^TOO_MANY_STEPS/)]);
    });

    it('versions a policy, one per scope, hidden from other schools and from admins', async () => {
      const id = await publishPolicy([{ on: 'beforeIssue', fn: 'oncePerSubject' }]);
      await request(app)
        .put(`/api/documents/policies/${id}/draft`)
        .set('Authorization', director)
        .send({ steps: [] })
        .expect(200);
      await request(app)
        .post(`/api/documents/policies/${id}/publish`)
        .set('Authorization', director)
        .send({})
        .expect(201);
      const versions = await request(app)
        .get(`/api/documents/policies/${id}/versions`)
        .set('Authorization', director)
        .expect(200);
      expect(versions.body.data.map((v: { version: number }) => v.version)).toEqual([1, 2]);
      expect(versions.body.data[0].steps).toEqual([
        { on: 'beforeIssue', fn: 'oncePerSubject', args: { per: 'period' } },
      ]);

      const again = await request(app)
        .post('/api/documents/policies')
        .set('Authorization', director)
        .send({ documentType: 'bulletin', steps: [] })
        .expect(409);
      expect(again.body.error.code).toBe('CONFLICT');

      const other = await directorOf(await createTenant());
      await request(app)
        .get(`/api/documents/policies/${id}`)
        .set('Authorization', other)
        .expect(404);

      const { user, worker } = await createAdminIn(tenant.subSchoolId);
      const admin = bearer({
        id: user.id,
        email: user.email,
        role: 'admin',
        schoolId: tenant.schoolId,
        subSchoolId: worker.subSchoolId,
      });
      await request(app).get('/api/documents/policies').set('Authorization', admin).expect(403);
    });
  });

  describe('catalogue functions', () => {
    it('requireFeesPaid refuses while unpaid payments exceed the tolerance', async () => {
      await publishPolicy([
        { on: 'beforeIssue', fn: 'requireFeesPaid', args: { upTo: 'period', toleranceFc: 1000 } },
      ]);
      const student = data.students[0]!;
      // Due during the term, and due after it: only the first counts for "period".
      const [during] = await db
        .insert(payments)
        .values({
          studentId: student.id,
          amount: '5000.00',
          type: 'TUITION',
          paymentDate: new Date('2025-10-01'),
        })
        .returning();
      await db.insert(payments).values({
        studentId: student.id,
        amount: '9000.00',
        type: 'TUITION',
        paymentDate: new Date('2026-02-01'),
      });

      const refused = await issue().expect(422);
      expect(refused.body.error).toMatchObject({ code: 'FEES_UNPAID' });
      expect(refused.body.error.message).toBe('5000 FC still due (tolerance 1000 FC)');

      await db.update(payments).set({ status: 'PAID' }).where(eq(payments.id, during!.id));
      await issue().expect(201);
    });

    it('requireFeesPaid on the whole year, for some kinds of payment only', async () => {
      await publishPolicy([
        {
          on: 'beforeIssue',
          fn: 'requireFeesPaid',
          args: { upTo: 'year', paymentTypes: ['TUITION'] },
        },
      ]);
      const [student, other] = data.students;
      await db
        .insert(payments)
        .values({ studentId: student!.id, amount: '200.00', type: 'CANTEEN' });
      await issue(issueBody(data, student)).expect(201);

      await db.insert(payments).values({ studentId: other!.id, amount: '10.00', type: 'TUITION' });
      expect((await issue(issueBody(data, other)).expect(422)).body.error.code).toBe('FEES_UNPAID');
    });

    it('requireAllGrades refuses while a course of the class has no grade in the period', async () => {
      const student = data.students[0]!;
      const run = () =>
        db.transaction((tx) =>
          policyFunctions.requireAllGrades!({
            event: 'beforeIssue',
            args: {},
            tx: new DrizzleIssuingTx(tx),
            actor: { userId: 'u', schoolId: tenant.schoolId, role: 'director' },
            documentType: 'certificate',
            schoolId: tenant.schoolId,
            subSchoolId: tenant.subSchoolId,
            subject: { type: 'student', id: student.id },
            params: {
              studentId: student.id,
              classId: data.klass.id,
              academicPeriodId: data.period.id,
            },
            payload: null,
            document: null,
            replacesId: null,
            today: '2025-12-19',
            now: new Date(),
          }),
        );
      expect(await run()).toBeUndefined();

      const [one] = await db.select().from(grades).where(eq(grades.studentId, student.id)).limit(1);
      await db.update(grades).set({ score: null }).where(eq(grades.id, one!.id));
      expect(await run()).toEqual({
        refuse: 'MISSING_GRADES',
        message: '1 of 2 courses have no grade',
      });
    });

    it('requireAttendance counts late as present and leaves excused days out', async () => {
      await publishPolicy([
        { on: 'beforeIssue', fn: 'requireAttendance', args: { minPercent: 60 } },
      ]);
      const student = data.students[0]!;
      const days = [
        'PRESENT',
        'PRESENT',
        'LATE',
        'ABSENT',
        'ABSENT',
        'EXCUSED',
        'EXCUSED',
      ] as const;
      await db.insert(studentAttendances).values(
        days.map((status, i) => ({
          subSchoolId: tenant.subSchoolId,
          studentId: student.id,
          date: `2025-10-${String(i + 1).padStart(2, '0')}`,
          status,
        })),
      );
      // 3 present of 5 counted days: 60 %.
      await issue().expect(201);

      // An absence after the term does not count.
      await db.insert(studentAttendances).values({
        subSchoolId: tenant.subSchoolId,
        studentId: student.id,
        date: '2026-01-10',
        status: 'ABSENT',
      });
      await issue().expect(201);

      await db.insert(studentAttendances).values({
        subSchoolId: tenant.subSchoolId,
        studentId: student.id,
        date: '2025-11-03',
        status: 'ABSENT',
      });
      const refused = await issue().expect(422);
      expect(refused.body.error).toMatchObject({
        code: 'ATTENDANCE_TOO_LOW',
        message: 'Attendance 50% is below 60%',
      });
    });

    it('oncePerSubject refuses a second bulletin of the term, and lets a correction through', async () => {
      await publishPolicy([{ on: 'beforeIssue', fn: 'oncePerSubject' }]);
      const first = (await issue().expect(201)).body.data;
      const again = await issue().expect(422);
      expect(again.body.error.code).toBe('ALREADY_ISSUED');
      expect(again.body.error.message).toContain(first.number);

      await issue({
        ...issueBody(data),
        replaces: { id: first.id, reason: 'Note corrigée' },
      }).expect(201);
      await issue(issueBody(data, data.students[1])).expect(201);
    });

    it('oncePerSubject holds under concurrent issues: one document, one refusal', async () => {
      await publishPolicy([{ on: 'beforeIssue', fn: 'oncePerSubject' }]);
      const results = await Promise.all([issue(), issue(), issue()]);
      expect(results.map((r) => r.status).sort()).toEqual([201, 422, 422]);
      const docs = await db
        .select()
        .from(issuedDocuments)
        .where(eq(issuedDocuments.subjectId, data.students[0]!.id));
      expect(docs).toHaveLength(1);
    });

    it('requireRole refuses the roles it does not list, on issue and on revoke', async () => {
      await publishPolicy([
        { on: 'beforeIssue', fn: 'requireRole', args: { roles: ['director'] } },
        { on: 'beforeRevoke', fn: 'requireRole', args: { roles: ['super_admin'] } },
      ]);
      const { user, worker } = await createAdminIn(tenant.subSchoolId);
      const admin = bearer({
        id: user.id,
        email: user.email,
        role: 'admin',
        schoolId: tenant.schoolId,
        subSchoolId: worker.subSchoolId,
      });
      expect((await issue(issueBody(data), admin).expect(422)).body.error.code).toBe(
        'ROLE_NOT_ALLOWED',
      );
      const doc = (await issue().expect(201)).body.data;

      const revoke = await request(app)
        .post(`/api/documents/issued/${doc.id}/revoke`)
        .set('Authorization', director)
        .send({ reason: 'Erreur' })
        .expect(422);
      expect(revoke.body.error.code).toBe('ROLE_NOT_ALLOWED');
      const [row] = await db.select().from(issuedDocuments).where(eq(issuedDocuments.id, doc.id));
      expect(row!.status).toBe('issued');
    });

    it('publishToParentPortal shares the document with each parent, once', async () => {
      await publishPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
      const student = data.students[0]!;
      const [mother, father] = [
        await createParent(tenant.subSchoolId),
        await createParent(tenant.subSchoolId),
      ];
      await linkParentToStudent(mother.id, student.id);
      await linkParentToStudent(father.id, student.id);

      const doc = (await issue().expect(201)).body.data;
      expect(await db.select().from(documentParentShares)).toEqual([]);

      expect(await getDocuments().worker.runOnce()).toBe(1);
      const shares = await db.select().from(documentParentShares);
      expect(shares.map((s) => s.parentId).sort()).toEqual([mother.id, father.id].sort());
      expect(shares.every((s) => s.issuedDocumentId === doc.id)).toBe(true);

      // The same action delivered twice shares nothing more.
      const [entry] = await db.select().from(documentOutbox);
      await db
        .update(documentOutbox)
        .set({ status: 'pending' })
        .where(eq(documentOutbox.id, entry!.id));
      expect(await getDocuments().worker.runOnce()).toBe(1);
      expect(await db.select().from(documentParentShares)).toHaveLength(2);
    });
  });

  describe('transaction and outbox', () => {
    it('a refusal takes no number and writes no action', async () => {
      await publishPolicy([
        { on: 'beforeIssue', fn: 'requireFeesPaid', args: { upTo: 'year' } },
        { on: 'afterIssue', fn: 'publishToParentPortal' },
      ]);
      await db
        .insert(payments)
        .values({ studentId: data.students[0]!.id, amount: '1.00', type: 'OTHER' });
      await issue().expect(422);
      expect(await count(issuedDocuments)).toBe(0);
      expect(await count(documentOutbox)).toBe(0);
      expect(await count(documentNumberSequences)).toBe(0);
      expect(files.objects.size).toBe(0);

      const doc = (await issue(issueBody(data, data.students[1])).expect(201)).body.data;
      expect(doc.number).toMatch(/-000001$/);
    });

    it('writes the action with the document and the policy applied', async () => {
      const policyId = await publishPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
      const doc = (await issue().expect(201)).body.data;
      expect(doc).toMatchObject({ policyId, policyVersion: 1 });
      const [entry] = await db.select().from(documentOutbox);
      expect(entry).toMatchObject({
        issuedDocumentId: doc.id,
        schoolId: tenant.schoolId,
        event: 'afterIssue',
        fn: 'publishToParentPortal',
        status: 'pending',
        attempts: 0,
      });
    });

    it('rolls the action back with the document when the issue fails late', async () => {
      await publishPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
      files.put = async () => {
        throw new Error('S3 is down');
      };
      await issue().expect(500);
      expect(await count(issuedDocuments)).toBe(0);
      expect(await count(documentOutbox)).toBe(0);
      expect(await count(documentNumberSequences)).toBe(0);
    });

    it('retries later and later, then fails after 8 attempts, and can be retried by hand', async () => {
      let down = true;
      configure({
        policyFunctions: {
          ...policyFunctions,
          publishToParentPortal: async () => {
            if (down) throw new Error('portal down');
          },
        },
      });
      await publishPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
      await issue().expect(201);
      const worker = getDocuments().worker;

      const delays: number[] = [];
      for (let attempt = 1; attempt <= 8; attempt++) {
        const [before] = await db.select().from(documentOutbox);
        clock = new Date(Math.max(before!.nextAttemptAt.getTime(), clock.getTime()));
        expect(await worker.runOnce()).toBe(1);
        const [after] = await db.select().from(documentOutbox);
        expect(after).toMatchObject({ attempts: attempt, lastError: 'portal down' });
        if (attempt < 8) {
          expect(after!.status).toBe('pending');
          delays.push((after!.nextAttemptAt.getTime() - clock.getTime()) / 60_000);
          // Not due yet.
          expect(await worker.runOnce()).toBe(0);
        } else {
          expect(after!.status).toBe('failed');
        }
      }
      expect(delays).toEqual([1, 5, 30, 120, 360, 720, 1440]);

      const failed = await request(app)
        .get('/api/documents/outbox?status=failed')
        .set('Authorization', director)
        .expect(200);
      expect(failed.body.data).toHaveLength(1);
      const id = failed.body.data[0].id;

      down = false;
      const retried = await request(app)
        .post(`/api/documents/outbox/${id}/retry`)
        .set('Authorization', director)
        .expect(200);
      expect(retried.body.data).toMatchObject({ status: 'pending', attempts: 0 });
      expect(await worker.runOnce()).toBe(1);
      const [done] = await db.select().from(documentOutbox);
      expect(done).toMatchObject({ status: 'done', attempts: 1 });
      await request(app)
        .post(`/api/documents/outbox/${id}/retry`)
        .set('Authorization', director)
        .expect(409);

      const other = await directorOf(await createTenant());
      await request(app)
        .post(`/api/documents/outbox/${id}/retry`)
        .set('Authorization', other)
        .expect(404);
    });

    it('two workers never take the same row', async () => {
      await publishPolicy([{ on: 'afterIssue', fn: 'publishToParentPortal' }]);
      for (let i = 0; i < 6; i++) await issue().expect(201);

      const runs: string[] = [];
      const makeWorker = () =>
        new OutboxWorker({
          outbox: new DrizzleOutboxStore(),
          issued: new DrizzleIssuedDocumentStore(),
          runner: {
            act: async (ctx) => {
              runs.push(ctx.idempotencyKey);
              // Long enough for the other worker to come by while the row is locked.
              await new Promise((resolve) => setTimeout(resolve, 40));
            },
          },
          now: () => new Date(),
        });
      const [a, b] = await Promise.all([makeWorker().runOnce(), makeWorker().runOnce()]);
      expect(a + b).toBe(6);
      expect(a).toBeGreaterThan(0);
      expect(b).toBeGreaterThan(0);
      expect(runs).toHaveLength(6);
      expect(new Set(runs).size).toBe(6);
      const statuses = await db.select({ status: documentOutbox.status }).from(documentOutbox);
      expect(statuses.every((s) => s.status === 'done')).toBe(true);
    });
  });
});

describe('catalogue lists', () => {
  it('match the enums of the backend', () => {
    expect([...PAYMENT_TYPES]).toEqual(paymentTypeEnum.enumValues);
    expect([...USER_ROLES]).toEqual(roleEnum.enumValues);
  });
});
