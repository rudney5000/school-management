import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { createAdminIn, createTenant, type Tenant } from '../setup/factories';

const app = createApp();

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
