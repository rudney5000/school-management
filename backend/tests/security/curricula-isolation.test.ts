import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { createApp } from '@/app';
import { db } from '@/db';
import { attachments, curriculumClasses } from '@/db/schema';
import { bearer } from '../setup/auth';
import {
  createAdminIn,
  createClass,
  createEnrollment,
  createParent,
  createStudent,
  createSubSchool,
  createTenant,
  createUser,
  linkParentToStudent,
  type Tenant,
} from '../setup/factories';

const app = createApp();

type StaffRole = 'director' | 'teacher';

async function staffToken(tenant: Tenant, subSchoolId: string, role: StaffRole) {
  const user = await createUser(role);
  return bearer({
    id: user.id,
    email: user.email ?? undefined,
    role,
    schoolId: tenant.schoolId,
    subSchoolId,
  });
}

async function adminToken(tenant: Tenant, subSchoolId: string) {
  const { user } = await createAdminIn(subSchoolId);
  return bearer({
    id: user.id,
    email: user.email ?? undefined,
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId,
  });
}

async function familyTokens(tenant: Tenant, classId: string) {
  const child = await createStudent(tenant.subSchoolId);
  await createEnrollment(child.id, classId);

  const parent = await createParent(tenant.subSchoolId);
  await linkParentToStudent(parent.id, child.id);
  const parentUser = await createUser('parent', { parentId: parent.id });
  const studentUser = await createUser('student', { studentId: child.id });

  const token = (user: typeof parentUser, role: 'parent' | 'student') =>
    bearer({
      id: user.id,
      email: user.email ?? undefined,
      role,
      schoolId: tenant.schoolId,
      subSchoolId: tenant.subSchoolId,
    });

  return { parent: token(parentUser, 'parent'), student: token(studentUser, 'student') };
}

async function createCurriculum(token: string, classIds: string[], publish = false) {
  const response = await request(app)
    .post('/api/curricula')
    .set('Authorization', token)
    .send({
      title: 'Programme national de mathématiques',
      type: 'national',
      schoolYear: '2026-2027',
      classIds,
    })
    .expect(201);

  const id = response.body.data.id as string;
  if (publish) {
    await request(app).post(`/api/curricula/${id}/publish`).set('Authorization', token).expect(200);
  }
  return id;
}

describe('curricula', () => {
  let tenant: Tenant;
  let director: string;

  beforeEach(async () => {
    tenant = await createTenant();
    director = await staffToken(tenant, tenant.subSchoolId, 'director');
  });

  describe('management', () => {
    it('lets a director create a programme for several classes, then publish it', async () => {
      const classA = await createClass(tenant.subSchoolId);
      const classB = await createClass(tenant.subSchoolId);

      const id = await createCurriculum(director, [classA.id, classB.id, classA.id]);

      const draft = await request(app)
        .get(`/api/curricula/${id}`)
        .set('Authorization', director)
        .expect(200);
      expect(draft.body.data.status).toBe('draft');
      expect(draft.body.data.classes.map((c: { id: string }) => c.id).sort()).toEqual(
        [classA.id, classB.id].sort(),
      );

      const published = await request(app)
        .post(`/api/curricula/${id}/publish`)
        .set('Authorization', director)
        .expect(200);
      expect(published.body.data.status).toBe('published');
      expect(published.body.data.publishedAt).not.toBeNull();
    });

    it('replaces the linked classes on update', async () => {
      const classA = await createClass(tenant.subSchoolId);
      const classB = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [classA.id]);

      const response = await request(app)
        .patch(`/api/curricula/${id}`)
        .set('Authorization', director)
        .send({ title: 'Nouveau titre', classIds: [classB.id] })
        .expect(200);

      expect(response.body.data.title).toBe('Nouveau titre');
      expect(response.body.data.classes.map((c: { id: string }) => c.id)).toEqual([classB.id]);
    });

    it('rejects an invalid school year', async () => {
      const klass = await createClass(tenant.subSchoolId);

      await request(app)
        .post('/api/curricula')
        .set('Authorization', director)
        .send({ title: 'X', type: 'school', schoolYear: '2026-2028', classIds: [klass.id] })
        .expect(400);
    });

    it('refuses writes from a teacher', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const teacher = await staffToken(tenant, tenant.subSchoolId, 'teacher');

      await request(app)
        .post('/api/curricula')
        .set('Authorization', teacher)
        .send({ title: 'X', type: 'school', schoolYear: '2026-2027', classIds: [klass.id] })
        .expect(403);
    });

    it('deletes the class links and file rows with the programme', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const admin = await adminToken(tenant, tenant.subSchoolId);
      const id = await createCurriculum(admin, [klass.id]);

      const presign = await request(app)
        .post(`/api/curricula/${id}/files/presign`)
        .set('Authorization', admin)
        .send({ filename: 'programme.pdf', mimeType: 'application/pdf', size: 1024 })
        .expect(200);

      await request(app)
        .post(`/api/curricula/${id}/files`)
        .set('Authorization', admin)
        .send({
          filename: 'programme.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          key: presign.body.data.key,
        })
        .expect(201);

      await request(app).delete(`/api/curricula/${id}`).set('Authorization', admin).expect(204);

      const links = await db
        .select()
        .from(curriculumClasses)
        .where(eq(curriculumClasses.curriculumId, id));
      const files = await db
        .select()
        .from(attachments)
        .where(and(eq(attachments.attachableType, 'curriculum'), eq(attachments.attachableId, id)));
      expect(links).toHaveLength(0);
      expect(files).toHaveLength(0);
    });
  });

  describe('files and publication', () => {
    async function presigned(token: string, id: string, mimeType = 'application/pdf') {
      const response = await request(app)
        .post(`/api/curricula/${id}/files/presign`)
        .set('Authorization', token)
        .send({ filename: 'programme', mimeType, size: 1024 })
        .expect(200);
      return response.body.data.key as string;
    }

    it('refuses to record the same file twice', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const admin = await adminToken(tenant, tenant.subSchoolId);
      const id = await createCurriculum(admin, [klass.id]);
      const key = await presigned(admin, id);
      const file = { filename: 'programme.pdf', mimeType: 'application/pdf', size: 1024, key };

      await request(app)
        .post(`/api/curricula/${id}/files`)
        .set('Authorization', admin)
        .send(file)
        .expect(201);
      await request(app)
        .post(`/api/curricula/${id}/files`)
        .set('Authorization', admin)
        .send(file)
        .expect(409);
    });

    it('refuses a type that does not match the presigned file', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const admin = await adminToken(tenant, tenant.subSchoolId);
      const id = await createCurriculum(admin, [klass.id]);
      const key = await presigned(
        admin,
        id,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );

      await request(app)
        .post(`/api/curricula/${id}/files`)
        .set('Authorization', admin)
        .send({ filename: 'programme.pdf', mimeType: 'application/pdf', size: 1024, key })
        .expect(400);
    });

    it('keeps the first publication date when published again', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id], true);

      const first = await request(app).get(`/api/curricula/${id}`).set('Authorization', director);
      const again = await request(app)
        .post(`/api/curricula/${id}/publish`)
        .set('Authorization', director)
        .expect(200);

      expect(again.body.data.publishedAt).toBe(first.body.data.publishedAt);
    });

    it('counts the files of each programme in the list', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const admin = await adminToken(tenant, tenant.subSchoolId);
      const id = await createCurriculum(admin, [klass.id]);
      for (let i = 0; i < 2; i++) {
        const key = await presigned(admin, id);
        await request(app)
          .post(`/api/curricula/${id}/files`)
          .set('Authorization', admin)
          .send({ filename: `p${i}.pdf`, mimeType: 'application/pdf', size: 1024, key })
          .expect(201);
      }

      const list = await request(app).get('/api/curricula').set('Authorization', admin).expect(200);
      expect(list.body.data[0].fileCount).toBe(2);
    });
  });

  describe('tenant isolation', () => {
    it('refuses to link a class of another sub-school', async () => {
      const otherSubSchool = await createSubSchool(tenant.schoolId);
      const foreignClass = await createClass(otherSubSchool);

      await request(app)
        .post('/api/curricula')
        .set('Authorization', director)
        .send({ title: 'X', type: 'school', schoolYear: '2026-2027', classIds: [foreignClass.id] })
        .expect(400);
    });

    it('hides a programme from the director of another sub-school', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id], true);

      const otherSubSchool = await createSubSchool(tenant.schoolId);
      const otherDirector = await staffToken(tenant, otherSubSchool, 'director');

      await request(app)
        .get(`/api/curricula/${id}`)
        .set('Authorization', otherDirector)
        .expect(404);
      await request(app)
        .patch(`/api/curricula/${id}`)
        .set('Authorization', otherDirector)
        .send({ title: 'Hijacked' })
        .expect(404);
      await request(app)
        .delete(`/api/curricula/${id}`)
        .set('Authorization', otherDirector)
        .expect(404);

      const list = await request(app)
        .get('/api/curricula')
        .set('Authorization', otherDirector)
        .expect(200);
      expect(list.body.data).toHaveLength(0);
    });

    it('refuses a file key outside the programme folder', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id]);

      await request(app)
        .post(`/api/curricula/${id}/files`)
        .set('Authorization', director)
        .send({
          filename: 'stolen.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          key: `schools/${crypto.randomUUID()}/enrollments/${crypto.randomUUID()}/x.pdf`,
        })
        .expect(400);
    });

    it('keeps curriculum files out of the generic attachment routes', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id]);

      await request(app)
        .get('/api/attachments')
        .query({ attachableType: 'curriculum', attachableId: id })
        .set('Authorization', director)
        .expect(403);
    });
  });

  describe('teachers', () => {
    it('see published programmes of their sub-school, not drafts', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const publishedId = await createCurriculum(director, [klass.id], true);
      const draftId = await createCurriculum(director, [klass.id]);
      const teacher = await staffToken(tenant, tenant.subSchoolId, 'teacher');

      const list = await request(app)
        .get('/api/curricula')
        .set('Authorization', teacher)
        .expect(200);
      expect(list.body.data.map((c: { id: string }) => c.id)).toEqual([publishedId]);

      await request(app).get(`/api/curricula/${draftId}`).set('Authorization', teacher).expect(404);
    });
  });

  describe('parents and students', () => {
    it('see the published programme of their own class', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id], true);
      const family = await familyTokens(tenant, klass.id);

      for (const token of [family.parent, family.student]) {
        const list = await request(app)
          .get('/api/curricula')
          .set('Authorization', token)
          .expect(200);
        expect(list.body.data.map((c: { id: string }) => c.id)).toEqual([id]);

        await request(app).get(`/api/curricula/${id}`).set('Authorization', token).expect(200);
      }
    });

    it('do not see a draft of their own class', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const id = await createCurriculum(director, [klass.id]);
      const family = await familyTokens(tenant, klass.id);

      const list = await request(app)
        .get('/api/curricula')
        .set('Authorization', family.parent)
        .expect(200);
      expect(list.body.data).toHaveLength(0);
      await request(app)
        .get(`/api/curricula/${id}`)
        .set('Authorization', family.parent)
        .expect(404);
    });

    it('do not see the programme of another class of the same sub-school', async () => {
      const ownClass = await createClass(tenant.subSchoolId);
      const otherClass = await createClass(tenant.subSchoolId);
      const otherId = await createCurriculum(director, [otherClass.id], true);
      const family = await familyTokens(tenant, ownClass.id);

      for (const token of [family.parent, family.student]) {
        const list = await request(app)
          .get('/api/curricula')
          .set('Authorization', token)
          .expect(200);
        expect(list.body.data).toHaveLength(0);
        await request(app).get(`/api/curricula/${otherId}`).set('Authorization', token).expect(404);
      }
    });

    it('cannot download a file of another class programme', async () => {
      const ownClass = await createClass(tenant.subSchoolId);
      const otherClass = await createClass(tenant.subSchoolId);
      const otherId = await createCurriculum(director, [otherClass.id], true);
      const family = await familyTokens(tenant, ownClass.id);

      const [file] = await db
        .insert(attachments)
        .values({
          attachableType: 'curriculum',
          attachableId: otherId,
          category: 'curriculum',
          key: `schools/${tenant.subSchoolId}/curricula/${otherId}/${crypto.randomUUID()}.pdf`,
          filename: 'programme.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          uploadedBy: crypto.randomUUID(),
          status: 'validated',
        })
        .returning();

      await request(app)
        .get(`/api/curricula/${otherId}/files/${file.id}/download`)
        .set('Authorization', family.parent)
        .expect(404);
    });

    it('cannot write', async () => {
      const klass = await createClass(tenant.subSchoolId);
      const family = await familyTokens(tenant, klass.id);

      await request(app)
        .post('/api/curricula')
        .set('Authorization', family.parent)
        .send({ title: 'X', type: 'school', schoolYear: '2026-2027', classIds: [klass.id] })
        .expect(403);
    });
  });
});
