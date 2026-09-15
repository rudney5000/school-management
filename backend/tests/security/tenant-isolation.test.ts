import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import { createStudent, createSubSchool, createTenant, type Tenant } from '../setup/factories';

const app = createApp();

/** A token for an account whose school never resolved — what self-registration produces. */
const orphanAdmin = () =>
  bearer({ id: crypto.randomUUID(), email: 'orphan@test.local', role: 'admin', schoolId: '' });

/** A token for an admin of `schoolId` that carries no sub-school of its own. */
const schoolAdmin = (schoolId: string) =>
  bearer({ id: crypto.randomUUID(), email: 'admin@test.local', role: 'admin', schoolId });

describe('sub-school isolation', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
  });

  describe('GET /api/students', () => {
    it('refuses a sub-school belonging to another school', async () => {
      await createStudent(schoolB.subSchoolId);

      const response = await request(app)
        .get('/api/students')
        .query({ subSchoolId: schoolB.subSchoolId })
        .set('Authorization', schoolAdmin(schoolA.schoolId))
        .expect(403);

      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('refuses an account whose school never resolved', async () => {
      await createStudent(schoolB.subSchoolId);

      await request(app)
        .get('/api/students')
        .query({ subSchoolId: schoolB.subSchoolId })
        .set('Authorization', orphanAdmin())
        .expect(403);
    });

    it('allows a sibling sub-school within the caller own school', async () => {
      const sibling = await createSubSchool(schoolA.schoolId);
      const student = await createStudent(sibling);

      const response = await request(app)
        .get('/api/students')
        .query({ subSchoolId: sibling })
        .set('Authorization', schoolAdmin(schoolA.schoolId))
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(student.id);
    });

    it('ignores the query string when the token carries a sub-school', async () => {
      await createStudent(schoolA.subSchoolId);
      await createStudent(schoolB.subSchoolId);

      const response = await request(app)
        .get('/api/students')
        .query({ subSchoolId: schoolB.subSchoolId })
        .set(
          'Authorization',
          bearer({
            id: crypto.randomUUID(),
            email: 'admin-a@test.local',
            role: 'admin',
            schoolId: schoolA.schoolId,
            subSchoolId: schoolA.subSchoolId,
          }),
        )
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].subSchoolId).toBe(schoolA.subSchoolId);
    });

    it('rejects a malformed sub-school id without a server error', async () => {
      const response = await request(app)
        .get('/api/students')
        .query({ subSchoolId: 'not-a-uuid' })
        .set('Authorization', schoolAdmin(schoolA.schoolId));

      // Rejected as invalid input or as forbidden — never a Postgres cast error.
      expect([400, 403]).toContain(response.status);
    });

    it('requires a sub-school when none can be derived', async () => {
      await request(app)
        .get('/api/students')
        .set('Authorization', schoolAdmin(schoolA.schoolId))
        .expect(400);
    });
  });

  describe('GET /api/students/:id', () => {
    it('does not expose a student from another school', async () => {
      const victim = await createStudent(schoolB.subSchoolId);

      await request(app)
        .get(`/api/students/${victim.id}`)
        .query({ subSchoolId: schoolB.subSchoolId })
        .set('Authorization', schoolAdmin(schoolA.schoolId))
        .expect(403);
    });
  });

  describe('super_admin', () => {
    it('may target any sub-school', async () => {
      await createStudent(schoolB.subSchoolId);

      const response = await request(app)
        .get('/api/students')
        .query({ subSchoolId: schoolB.subSchoolId })
        .set(
          'Authorization',
          bearer({
            id: crypto.randomUUID(),
            email: 'root@test.local',
            role: 'super_admin',
            schoolId: '',
          }),
        )
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });
  });
});
