import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import { createAdminIn, createTenant, type Tenant } from '../setup/factories';

const app = createApp();

const adminOf = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });

describe('auth', () => {
  let tenant: Tenant;

  beforeEach(async () => {
    tenant = await createTenant();
  });

  describe('POST /api/auth/login', () => {
    it('returns a token pair for valid credentials', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
    });

    it('rejects a wrong password', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'wrong-password' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects an unknown email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@test.local', password: 'password123' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/register — identifiers', () => {
    it('registers an account with only a phone and a username, no email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({
          phone: '+243810000001',
          username: 'no-email-user',
          password: 'password123',
          role: 'worker',
        })
        .expect(201);

      expect(response.body.data.email).toBeUndefined();
    });

    it('rejects registration with none of email, phone or username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({ password: 'password123', role: 'worker' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects a username identical to another account email', async () => {
      const { user: existing } = await createAdminIn(tenant.subSchoolId);

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({
          username: existing.email,
          password: 'password123',
          role: 'worker',
        })
        .expect(409);

      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('GET /api/auth/me', () => {
    it('resolves the tenant context of the authenticated user', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'password123' })
        .expect(200);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${login.body.data.accessToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: user.id,
        email: user.email,
        role: 'admin',
        schoolId: tenant.schoolId,
        subSchoolId: tenant.subSchoolId,
      });
    });

    it('rejects a request without a token', async () => {
      const response = await request(app).get('/api/auth/me').expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects a token signed with the wrong secret', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-valid-token')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
