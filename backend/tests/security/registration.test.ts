import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import { createTenant, createWorker, type Tenant } from '../setup/factories';

const app = createApp();

const adminOf = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });

describe('account creation', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
  });

  it('refuses anonymous registration', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'attacker@test.local', password: 'password123', role: 'admin' })
      .expect(401);

    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('refuses a non-administrative role', async () => {
    await request(app)
      .post('/api/auth/register')
      .set(
        'Authorization',
        bearer({
          id: crypto.randomUUID(),
          email: 'teacher@test.local',
          role: 'teacher',
          schoolId: schoolA.schoolId,
          subSchoolId: schoolA.subSchoolId,
        }),
      )
      .send({ email: 'new@test.local', password: 'password123', role: 'teacher' })
      .expect(403);
  });

  it('refuses to attach an account to a worker of another school', async () => {
    const theirWorker = await createWorker(schoolB.subSchoolId);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', adminOf(schoolA))
      .send({
        email: 'escalation@test.local',
        password: 'password123',
        role: 'admin',
        workerId: theirWorker.id,
      })
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('creates an account attached to a worker of the caller own school', async () => {
    const ourWorker = await createWorker(schoolA.subSchoolId);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', adminOf(schoolA))
      .send({
        email: 'colleague@test.local',
        password: 'password123',
        role: 'worker',
        workerId: ourWorker.id,
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      email: 'colleague@test.local',
      role: 'worker',
    });
  });

  it('never returns tokens for the created account', async () => {
    const ourWorker = await createWorker(schoolA.subSchoolId);

    const response = await request(app)
      .post('/api/auth/register')
      .set('Authorization', adminOf(schoolA))
      .send({
        email: 'no-tokens@test.local',
        password: 'password123',
        role: 'worker',
        workerId: ourWorker.id,
      })
      .expect(201);

    expect(response.body.data.accessToken).toBeUndefined();
    expect(response.body.data.refreshToken).toBeUndefined();
    expect(response.body.data.password).toBeUndefined();
  });
});
