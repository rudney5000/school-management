import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import {
  createParent,
  createPayment,
  createStudent,
  createTenant,
  createUser,
  linkParentToStudent,
  type Tenant,
} from '../setup/factories';

const app = createApp();

describe('parents may only read their own children payments', () => {
  let tenant: Tenant;

  beforeEach(async () => {
    tenant = await createTenant();
  });

  async function parentWithChild() {
    const parent = await createParent(tenant.subSchoolId);
    const child = await createStudent(tenant.subSchoolId);
    await linkParentToStudent(parent.id, child.id);
    const user = await createUser('parent', { parentId: parent.id });

    const token = bearer({
      id: user.id,
      email: user.email,
      role: 'parent',
      schoolId: tenant.schoolId,
      subSchoolId: tenant.subSchoolId,
    });

    return { parent, child, token };
  }

  it('reads a payment of its own child', async () => {
    const { child, token } = await parentWithChild();
    const payment = await createPayment(child.id);

    const response = await request(app)
      .get(`/api/payments/${payment.id}`)
      .set('Authorization', token)
      .expect(200);

    expect(response.body.data.id).toBe(payment.id);
  });

  it('does not read a payment of another family in the same school', async () => {
    const { token } = await parentWithChild();
    const otherChild = await createStudent(tenant.subSchoolId);
    const otherPayment = await createPayment(otherChild.id);

    await request(app)
      .get(`/api/payments/${otherPayment.id}`)
      .set('Authorization', token)
      .expect(404);
  });

  it('refuses a parent account with no parent profile', async () => {
    const user = await createUser('parent');
    const child = await createStudent(tenant.subSchoolId);
    const payment = await createPayment(child.id);

    await request(app)
      .get(`/api/payments/${payment.id}`)
      .set(
        'Authorization',
        bearer({
          id: user.id,
          email: user.email,
          role: 'parent',
          schoolId: tenant.schoolId,
          subSchoolId: tenant.subSchoolId,
        }),
      )
      .expect(403);
  });

  it('still lets staff read any payment of the sub-school', async () => {
    const child = await createStudent(tenant.subSchoolId);
    const payment = await createPayment(child.id);

    await request(app)
      .get(`/api/payments/${payment.id}`)
      .set(
        'Authorization',
        bearer({
          id: crypto.randomUUID(),
          email: 'admin@test.local',
          role: 'admin',
          schoolId: tenant.schoolId,
          subSchoolId: tenant.subSchoolId,
        }),
      )
      .expect(200);
  });
});
