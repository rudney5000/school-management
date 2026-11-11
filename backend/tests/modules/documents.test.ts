import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { bulletinOfficielRdc, type FileStore } from '@school-hub/documents';
import { createApp } from '@/app';
import { db } from '@/db';
import { academicPeriods, classCourses, courses, grades, subSchools } from '@/db/schema';
import { configureDocuments } from '@/modules/documents/documents.module';
import { bearer } from '../setup/auth';
import {
  createClass,
  createEnrollment,
  createStudent,
  createTenant,
  createUser,
  type Tenant,
} from '../setup/factories';

const app = createApp();

/** Stands in for S3: the bytes stay in memory. */
class MemoryFiles implements FileStore {
  readonly objects = new Map<string, Uint8Array>();
  async put(key: string, bytes: Uint8Array) {
    this.objects.set(key, bytes);
  }
  async get(key: string) {
    const bytes = this.objects.get(key);
    if (!bytes) throw new Error(`No object ${key}`);
    return bytes;
  }
}

let files: MemoryFiles;

async function directorOf(tenant: Tenant) {
  const user = await createUser('director');
  return bearer({
    id: user.id,
    email: user.email,
    role: 'director',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });
}

/** A class of three students, two courses, every grade entered. */
async function classWithGrades(tenant: Tenant) {
  const klass = await createClass(tenant.subSchoolId);
  const [period] = await db
    .insert(academicPeriods)
    .values({
      subSchoolId: tenant.subSchoolId,
      name: '1er Trimestre',
      type: 'trimester',
      startDate: new Date('2025-09-08'),
      endDate: new Date('2025-12-19'),
    })
    .returning();
  const subjects = await db
    .insert(courses)
    .values([
      { name: 'Mathématiques', code: 'MATH', subSchoolId: tenant.subSchoolId },
      { name: 'Français', code: 'FR', subSchoolId: tenant.subSchoolId },
    ])
    .returning();
  await db
    .insert(classCourses)
    .values(subjects.map((course) => ({ classId: klass.id, courseId: course.id })));

  // Percentages: 75, 50, 75 — the first and the last share the first place.
  const scores = [
    [30, 15],
    [20, 10],
    [32, 13],
  ];
  const students = [];
  for (const [math, french] of scores) {
    const student = await createStudent(tenant.subSchoolId);
    await createEnrollment(student.id, klass.id);
    await db.insert(grades).values([
      {
        studentId: student.id,
        courseId: subjects[0]!.id,
        classId: klass.id,
        academicPeriodId: period!.id,
        subSchoolId: tenant.subSchoolId,
        gradeType: 'exam',
        score: String(math),
        maxScore: '40',
        coefficient: '4',
      },
      {
        studentId: student.id,
        courseId: subjects[1]!.id,
        classId: klass.id,
        academicPeriodId: period!.id,
        subSchoolId: tenant.subSchoolId,
        gradeType: 'exam',
        score: String(french),
        maxScore: '20',
        coefficient: '2',
      },
    ]);
    students.push(student);
  }
  return { klass, period: period!, students };
}

async function publishedStarter(token: string) {
  const created = await request(app)
    .post('/api/documents/templates')
    .set('Authorization', token)
    .send({ documentType: 'bulletin', name: 'Bulletin officiel', starter: 'bulletin-officiel-rdc' })
    .expect(201);
  await request(app)
    .post(`/api/documents/templates/${created.body.data.id}/publish`)
    .set('Authorization', token)
    .send({ note: 'Première version' })
    .expect(201);
  return created.body.data as { id: string };
}

const issueBody = (
  data: Awaited<ReturnType<typeof classWithGrades>>,
  student = data.students[0]!,
) => ({
  type: 'bulletin',
  params: { studentId: student.id, classId: data.klass.id, academicPeriodId: data.period.id },
});

beforeEach(() => {
  files = new MemoryFiles();
  configureDocuments({ files, verifyBaseUrl: 'https://app.example.org' });
});

afterAll(() => configureDocuments({}));

describe('documents: templates and issuing', () => {
  let tenant: Tenant;
  let director: string;
  let code: string;

  beforeEach(async () => {
    tenant = await createTenant();
    director = await directorOf(tenant);
    const [row] = await db.select().from(subSchools).where(eq(subSchools.id, tenant.subSchoolId));
    code = row!.code;
  });

  it('refuses to issue before a template is published', async () => {
    const data = await classWithGrades(tenant);
    const res = await request(app)
      .post('/api/documents/issued')
      .set('Authorization', director)
      .send(issueBody(data))
      .expect(422);
    expect(res.body.error.code).toBe('NO_TEMPLATE');
  });

  it('reports every problem of a broken layout', async () => {
    const res = await request(app)
      .post('/api/documents/templates')
      .set('Authorization', director)
      .send({
        documentType: 'bulletin',
        name: 'Cassé',
        layout: {
          ...bulletinOfficielRdc.layout,
          blocks: [{ type: 'title', text: '{{student.nom}}' }],
        },
      })
      .expect(400);
    expect(Object.keys(res.body.error.details)).toEqual(
      expect.arrayContaining(['blocks.0.text', 'blocks']),
    );
  });

  it('issues a bulletin from the real grades, stores it and verifies it publicly', async () => {
    await publishedStarter(director);
    const data = await classWithGrades(tenant);

    const issued = await request(app)
      .post('/api/documents/issued')
      .set('Authorization', director)
      .send(issueBody(data))
      .expect(201);
    const doc = issued.body.data;
    expect(doc.number).toBe(`${code}-BUL-2025-2026-000001`);
    expect(doc.payload).toMatchObject({
      period: { name: '1er Trimestre', schoolYear: '2025-2026' },
      rows: [
        { course: 'Français', score: 15, max: 20, coefficient: 2 },
        { course: 'Mathématiques', score: 30, max: 40, coefficient: 4 },
      ],
      totals: { obtained: 45, max: 60, percent: 75 },
      rank: { position: 1, of: 3 },
    });

    const pdf = await request(app)
      .get(`/api/documents/issued/${doc.id}/pdf`)
      .set('Authorization', director)
      .buffer(true)
      .parse((res, done) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => done(null, Buffer.concat(chunks)));
      })
      .expect(200);
    expect(pdf.headers['content-type']).toBe('application/pdf');
    expect((pdf.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
    expect(files.objects.size).toBe(1);

    // Public: no token.
    const verified = await request(app).get(`/api/documents/verify/${doc.id}`).expect(200);
    expect(verified.body.data).toMatchObject({
      number: doc.number,
      status: 'issued',
      holderName: expect.stringMatching(/^F\*\*\* L\*\*\*$/),
    });
    expect(verified.body.data).not.toHaveProperty('payload');

    await request(app)
      .post(`/api/documents/issued/${doc.id}/revoke`)
      .set('Authorization', director)
      .send({ reason: 'Note erronée' })
      .expect(200);
    const after = await request(app).get(`/api/documents/verify/${doc.id}`).expect(200);
    expect(after.body.data.status).toBe('revoked');
  });

  it('gives distinct, gap-free numbers to documents issued at the same time', async () => {
    await publishedStarter(director);
    const data = await classWithGrades(tenant);
    const responses = await Promise.all(
      data.students.map((student) =>
        request(app)
          .post('/api/documents/issued')
          .set('Authorization', director)
          .send(issueBody(data, student)),
      ),
    );
    expect(responses.map((r) => r.status)).toEqual([201, 201, 201]);
    expect(responses.map((r) => r.body.data.number).sort()).toEqual(
      [1, 2, 3].map((n) => `${code}-BUL-2025-2026-00000${n}`),
    );
  });

  it('corrects a document once: the old one points to its replacement', async () => {
    await publishedStarter(director);
    const data = await classWithGrades(tenant);
    const old = (
      await request(app)
        .post('/api/documents/issued')
        .set('Authorization', director)
        .send(issueBody(data))
        .expect(201)
    ).body.data;

    const correct = () =>
      request(app)
        .post('/api/documents/issued')
        .set('Authorization', director)
        .send({ ...issueBody(data), replaces: { id: old.id, reason: 'Rang corrigé' } });
    const [first, second] = await Promise.all([correct(), correct()]);
    expect([first.status, second.status].sort()).toEqual([201, 409]);

    const fixed = (first.status === 201 ? first : second).body.data;
    const verified = await request(app).get(`/api/documents/verify/${old.id}`).expect(200);
    expect(verified.body.data).toMatchObject({ status: 'revoked', replacedBy: fixed.number });
  });

  it('describes a document type and previews a layout that is not saved yet', async () => {
    const template = await publishedStarter(director);
    const type = await request(app)
      .get('/api/documents/types/bulletin')
      .set('Authorization', director)
      .expect(200);
    expect(type.body.data.variables).toContainEqual({
      path: 'student.fullName',
      kind: 'text',
      nullable: false,
    });

    const res = await request(app)
      .post(`/api/documents/templates/${template.id}/preview`)
      .set('Authorization', director)
      .send({ layout: { ...bulletinOfficielRdc.layout, blocks: [{ type: 'title', text: 'x' }] } })
      .expect(400);
    expect(res.body.error.code).toBe('REQUIRED_BLOCK_MISSING');

    await request(app)
      .post(`/api/documents/templates/${template.id}/preview`)
      .set('Authorization', director)
      .send({ layout: bulletinOfficielRdc.layout })
      .expect(200)
      .expect('Content-Type', 'application/pdf');
  });

  it('issues a free document from the chosen template, with its field values', async () => {
    const layout = {
      format: 1,
      page: {},
      theme: { font: 'NotoSerif' },
      fields: [{ key: 'studentName', label: "Nom de l'élève" }],
      blocks: [
        {
          type: 'richText',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: "Je certifie que l'élève " },
                { type: 'field', attrs: { key: 'studentName' } },
                { type: 'text', text: ' est inscrit(e).' },
              ],
            },
          ],
        },
      ],
    };
    const create = (name: string) =>
      request(app)
        .post('/api/documents/templates')
        .set('Authorization', director)
        .send({ documentType: 'free', name, layout })
        .expect(201);
    await create('Certificat de scolarité');
    const transfer = (await create('Certificat de transfert')).body.data;
    await request(app)
      .post(`/api/documents/templates/${transfer.id}/publish`)
      .set('Authorization', director)
      .send({})
      .expect(201);

    const missing = await request(app)
      .post('/api/documents/issued')
      .set('Authorization', director)
      .send({ type: 'free', templateId: transfer.id, fields: {} })
      .expect(400);
    expect(missing.body.error.code).toBe('INVALID_FIELDS');

    const issued = await request(app)
      .post('/api/documents/issued')
      .set('Authorization', director)
      .send({ type: 'free', templateId: transfer.id, fields: { studentName: 'MOUKOKO Ornella' } })
      .expect(201);
    expect(issued.body.data).toMatchObject({
      number: expect.stringMatching(new RegExp(`^${code}-DOC-\\d{4}-000001$`)),
      subjectId: null,
      payload: { fields: { studentName: 'MOUKOKO Ornella' } },
    });
    expect(files.objects.size).toBe(1);
  });

  it('files templates in folders through the API', async () => {
    const folder = (
      await request(app)
        .post('/api/documents/folders')
        .set('Authorization', director)
        .send({ name: 'Certificats' })
        .expect(201)
    ).body.data;
    const sub = (
      await request(app)
        .post('/api/documents/folders')
        .set('Authorization', director)
        .send({ name: 'Anciens', parentId: folder.id })
        .expect(201)
    ).body.data;
    const template = (
      await request(app)
        .post('/api/documents/templates')
        .set('Authorization', director)
        .send({
          documentType: 'bulletin',
          name: 'Bulletin',
          starter: 'bulletin-officiel-rdc',
          folderId: folder.id,
        })
        .expect(201)
    ).body.data;

    await request(app)
      .delete(`/api/documents/folders/${folder.id}`)
      .set('Authorization', director)
      .expect(409);
    await request(app)
      .post(`/api/documents/folders/${folder.id}/move`)
      .set('Authorization', director)
      .send({ parentId: sub.id, index: 0 })
      .expect(409);
    await request(app)
      .post(`/api/documents/templates/${template.id}/move`)
      .set('Authorization', director)
      .send({ folderId: sub.id, index: 0 })
      .expect(204);
    await request(app)
      .patch(`/api/documents/folders/${folder.id}`)
      .set('Authorization', director)
      .send({ name: 'Certificats 2026' })
      .expect(204);

    const library = (
      await request(app)
        .get('/api/documents/templates/library')
        .set('Authorization', director)
        .expect(200)
    ).body.data;
    expect(library.folders.map((f: { name: string }) => f.name)).toEqual([
      'Certificats 2026',
      'Anciens',
    ]);
    expect(library.templates).toMatchObject([{ id: template.id, folderId: sub.id }]);

    const removed = await request(app)
      .delete(`/api/documents/templates/${template.id}`)
      .set('Authorization', director)
      .expect(200);
    expect(removed.body.data).toEqual({ result: 'deleted' });
  });

  it('answers NOT_CONFIGURED when APP_BASE_URL is missing', async () => {
    configureDocuments({ files });
    const previous = process.env.APP_BASE_URL;
    delete process.env.APP_BASE_URL;
    try {
      const res = await request(app)
        .get('/api/documents/templates')
        .set('Authorization', director)
        .expect(503);
      expect(res.body.error.code).toBe('NOT_CONFIGURED');
    } finally {
      if (previous !== undefined) process.env.APP_BASE_URL = previous;
    }
  });
});

describe('documents: isolation between schools', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;
  let directorA: string;
  let directorB: string;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
    directorA = await directorOf(schoolA);
    directorB = await directorOf(schoolB);
  });

  it('hides the templates and documents of another school', async () => {
    const template = await publishedStarter(directorA);
    const data = await classWithGrades(schoolA);
    const doc = (
      await request(app)
        .post('/api/documents/issued')
        .set('Authorization', directorA)
        .send(issueBody(data))
        .expect(201)
    ).body.data;

    await request(app)
      .get(`/api/documents/templates/${template.id}`)
      .set('Authorization', directorB)
      .expect(404);
    await request(app)
      .get(`/api/documents/issued/${doc.id}/pdf`)
      .set('Authorization', directorB)
      .expect(404);
    await request(app)
      .post(`/api/documents/issued/${doc.id}/revoke`)
      .set('Authorization', directorB)
      .send({ reason: 'x' })
      .expect(404);
    const list = await request(app).get('/api/documents/issued').set('Authorization', directorB);
    expect(list.body.data).toEqual([]);
  });

  it("refuses to put another school's student on a bulletin", async () => {
    await publishedStarter(directorB);
    const data = await classWithGrades(schoolA);
    // School B issues in its own sub-school, but with the ids of school A.
    await request(app)
      .post('/api/documents/issued')
      .set('Authorization', directorB)
      .send(issueBody(data))
      .expect(404);
  });

  it('refuses to issue into another sub-school', async () => {
    const data = await classWithGrades(schoolA);
    await request(app)
      .post('/api/documents/issued')
      .set('Authorization', directorB)
      .send({ ...issueBody(data), subSchoolId: schoolA.subSchoolId })
      .expect(403);
  });
});
