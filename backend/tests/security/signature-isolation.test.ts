import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import { createTenant, type Tenant } from '../setup/factories';

const app = createApp();

/** An admin of `tenant` whose token carries no sub-school (multi-sub-school admin). */
const schoolAdmin = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
  });

const adminOf = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });

describe('signature tenant scope', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
  });

  it('refuses to sign an enrollment into another school', async () => {
    await request(app)
      .post('/api/document-signatures/enrollment')
      .set('Authorization', schoolAdmin(schoolA))
      .send({
        subSchoolId: schoolB.subSchoolId,
        enrollmentId: crypto.randomUUID(),
        studentId: crypto.randomUUID(),
      })
      .expect(403);
  });

  it('refuses a body sub-school that contradicts the token', async () => {
    await request(app)
      .post('/api/document-signatures/enrollment')
      .set('Authorization', adminOf(schoolA))
      .send({
        subSchoolId: schoolB.subSchoolId,
        enrollmentId: crypto.randomUUID(),
        studentId: crypto.randomUUID(),
      })
      .expect(403);
  });

  it('refuses to read a signature status of another school', async () => {
    await request(app)
      .get('/api/document-signatures/enrollment/status')
      .query({
        subSchoolId: schoolB.subSchoolId,
        enrollmentId: crypto.randomUUID(),
        studentId: crypto.randomUUID(),
      })
      .set('Authorization', schoolAdmin(schoolA))
      .expect(403);
  });

  it('does not revoke a signature belonging to another school', async () => {
    const response = await request(app)
      .patch(`/api/document-signatures/${crypto.randomUUID()}/revoke`)
      .set('Authorization', adminOf(schoolA))
      .send({ reason: 'test' });

    expect(response.status).toBe(404);
  });
});
