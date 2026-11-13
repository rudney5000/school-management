import { eq } from 'drizzle-orm';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { db } from '@/db';
import { userIdentifiers, users } from '@/db/schema';
import { bearer } from '../setup/auth';
import { createAdminIn, createTenant, createUser, type Tenant } from '../setup/factories';

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
        .send({ identifier: user.email, password: 'password123' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
    });

    it('logs in with a username', async () => {
      await createUser('worker', {}, 'password123', { username: 'jdoe' });

      await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'jdoe', password: 'password123' })
        .expect(200);
    });

    it('logs in with a phone number', async () => {
      await createUser('worker', {}, 'password123', { phone: '+243820000002' });

      await request(app)
        .post('/api/auth/login')
        .send({ identifier: '+243820000002', password: 'password123' })
        .expect(200);
    });

    it('logs in with a phone number typed with separators', async () => {
      await createUser('worker', {}, 'password123', { phone: '+243820000003' });

      await request(app)
        .post('/api/auth/login')
        .send({ identifier: '+243 (82) 000-0003', password: 'password123' })
        .expect(200);
    });

    it('logs in with an email or username regardless of case and surrounding spaces', async () => {
      const user = await createUser('worker', {}, 'password123', { username: 'casey' });

      for (const identifier of [` ${user.email!.toUpperCase()} `, 'Casey']) {
        await request(app)
          .post('/api/auth/login')
          .send({ identifier, password: 'password123' })
          .expect(200);
      }
    });

    it('puts the phone and username in the access token', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);
      await db
        .update(users)
        .set({ phone: '+243820000004', username: 'tokenuser' })
        .where(eq(users.id, user.id));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: user.email, password: 'password123' })
        .expect(200);

      const payload = JSON.parse(
        Buffer.from(response.body.data.accessToken.split('.')[1], 'base64url').toString(),
      );
      expect(payload).toMatchObject({ phone: '+243820000004', username: 'tokenuser' });
    });

    it('rejects a wrong password', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: user.email, password: 'wrong-password' })
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('rejects an unknown identifier with the same generic error as a wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'nobody@test.local', password: 'password123' })
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

    it('rejects a username shaped like another account email', async () => {
      const { user: existing } = await createAdminIn(tenant.subSchoolId);

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({
          username: existing.email,
          password: 'password123',
          role: 'worker',
        })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 409, not 500, for the email of an account created before user_identifiers', async () => {
      const [legacy] = await db
        .insert(users)
        .values({ email: 'legacy@test.local', password: 'x', role: 'worker' })
        .returning();
      const before = await db.select({ id: users.id }).from(users);

      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({ email: legacy.email, password: 'password123', role: 'worker' })
        .expect(409);

      expect(response.body.error.code).toBe('CONFLICT');
      // The account row is rolled back with its identifiers: no orphan is left.
      expect(await db.select({ id: users.id }).from(users)).toHaveLength(before.length);
    });

    it('lets only one of two concurrent registrations of the same phone succeed', async () => {
      const register = () =>
        request(app)
          .post('/api/auth/register')
          .set('Authorization', adminOf(tenant))
          .send({ phone: '+243810000099', password: 'password123', role: 'worker' });

      const statuses = (await Promise.all([register(), register()])).map((r) => r.status);

      expect(statuses.sort()).toEqual([201, 409]);
    });

    it.each([
      ['a username longer than 50 characters', { username: `u${'x'.repeat(50)}` }],
      ['a username that starts with a digit', { username: '0812345678' }],
      ['a phone number without a country code', { phone: '0812345678' }],
      ['a phone number longer than E.164 allows', { phone: '+2438123456789012' }],
      ['an email longer than 255 characters', { email: `${'a'.repeat(251)}@x.cd` }],
    ])('rejects %s with a 400', async (_label, identifier) => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({ ...identifier, password: 'password123', role: 'worker' })
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('stores identifiers in their normalized form', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({
          email: ' New.User@Test.Local ',
          phone: '+243 (81) 234-5678',
          username: 'NewUser',
          password: 'password123',
          role: 'worker',
        })
        .expect(201);

      const stored = await db
        .select({ type: userIdentifiers.type, value: userIdentifiers.value })
        .from(userIdentifiers)
        .where(eq(userIdentifiers.userId, response.body.data.id));

      expect(stored).toEqual(
        expect.arrayContaining([
          { type: 'email', value: 'new.user@test.local' },
          { type: 'phone', value: '+243812345678' },
          { type: 'username', value: 'newuser' },
        ]),
      );
    });
  });

  describe('GET /api/auth/me', () => {
    it('resolves the tenant context of the authenticated user', async () => {
      const { user } = await createAdminIn(tenant.subSchoolId);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ identifier: user.email, password: 'password123' })
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

    it('does not crash for an account with no email', async () => {
      await request(app)
        .post('/api/auth/register')
        .set('Authorization', adminOf(tenant))
        .send({
          phone: '+243830000003',
          username: 'no-email-me',
          password: 'password123',
          role: 'worker',
        })
        .expect(201);

      const login = await request(app)
        .post('/api/auth/login')
        .send({ identifier: 'no-email-me', password: 'password123' })
        .expect(200);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${login.body.data.accessToken}`)
        .expect(200);

      expect(response.body.data.email).toBeUndefined();
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
