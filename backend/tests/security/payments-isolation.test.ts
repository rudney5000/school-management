import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import { createPayment, createStudent, createTenant, type Tenant } from '../setup/factories';

const app = createApp();

const adminOf = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });

describe('payments isolation', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
  });

  it('lists only the payments of the caller sub-school', async () => {
    const ours = await createStudent(schoolA.subSchoolId);
    const theirs = await createStudent(schoolB.subSchoolId);
    const ourPayment = await createPayment(ours.id);
    await createPayment(theirs.id);

    const response = await request(app)
      .get('/api/payments')
      .set('Authorization', adminOf(schoolA))
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(ourPayment.id);
  });

  it('does not expose a payment from another school by id', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);
    const theirPayment = await createPayment(theirStudent.id);

    await request(app)
      .get(`/api/payments/${theirPayment.id}`)
      .set('Authorization', adminOf(schoolA))
      .expect(404);
  });

  it('refuses to create a payment for a student of another school', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);

    await request(app)
      .post('/api/payments')
      .set('Authorization', adminOf(schoolA))
      .send({ studentId: theirStudent.id, amount: 50, type: 'TUITION' })
      .expect(404);
  });

  it('refuses to update a payment from another school', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);
    const theirPayment = await createPayment(theirStudent.id);

    await request(app)
      .patch(`/api/payments/${theirPayment.id}`)
      .set('Authorization', adminOf(schoolA))
      .send({ amount: 1 })
      .expect(404);
  });

  it('refuses to delete a payment from another school', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);
    const theirPayment = await createPayment(theirStudent.id);

    await request(app)
      .delete(`/api/payments/${theirPayment.id}`)
      .set('Authorization', adminOf(schoolA))
      .expect(404);
  });

  it('still serves the caller own payment', async () => {
    const ours = await createStudent(schoolA.subSchoolId);
    const payment = await createPayment(ours.id);

    const response = await request(app)
      .get(`/api/payments/${payment.id}`)
      .set('Authorization', adminOf(schoolA))
      .expect(200);

    expect(response.body.data.id).toBe(payment.id);
  });
});
