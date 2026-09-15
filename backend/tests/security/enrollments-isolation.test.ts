import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { bearer } from '../setup/auth';
import {
  createClass,
  createEnrollment,
  createStudent,
  createTenant,
  type Tenant,
} from '../setup/factories';

const app = createApp();

const adminOf = (tenant: Tenant) =>
  bearer({
    id: crypto.randomUUID(),
    email: 'admin@test.local',
    role: 'admin',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });

describe('enrollments isolation', () => {
  let schoolA: Tenant;
  let schoolB: Tenant;

  beforeEach(async () => {
    schoolA = await createTenant();
    schoolB = await createTenant();
  });

  it('lists only the enrollments of the caller sub-school', async () => {
    const ourStudent = await createStudent(schoolA.subSchoolId);
    const ourClass = await createClass(schoolA.subSchoolId);
    const ours = await createEnrollment(ourStudent.id, ourClass.id);

    const theirStudent = await createStudent(schoolB.subSchoolId);
    const theirClass = await createClass(schoolB.subSchoolId);
    await createEnrollment(theirStudent.id, theirClass.id);

    const response = await request(app)
      .get('/api/enrollments')
      .set('Authorization', adminOf(schoolA))
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe(ours.id);
  });

  it('does not expose an enrollment from another school by id', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);
    const theirClass = await createClass(schoolB.subSchoolId);
    const theirs = await createEnrollment(theirStudent.id, theirClass.id);

    await request(app)
      .get(`/api/enrollments/${theirs.id}`)
      .set('Authorization', adminOf(schoolA))
      .expect(404);
  });

  it('refuses to enrol a student of another school into our class', async () => {
    const theirStudent = await createStudent(schoolB.subSchoolId);
    const ourClass = await createClass(schoolA.subSchoolId);

    await request(app)
      .post('/api/enrollments')
      .set('Authorization', adminOf(schoolA))
      .send({ studentId: theirStudent.id, classId: ourClass.id })
      .expect(404);
  });

  it('refuses to enrol our student into another school class', async () => {
    const ourStudent = await createStudent(schoolA.subSchoolId);
    const theirClass = await createClass(schoolB.subSchoolId);

    await request(app)
      .post('/api/enrollments')
      .set('Authorization', adminOf(schoolA))
      .send({ studentId: ourStudent.id, classId: theirClass.id })
      .expect(404);
  });

  it('still enrols within the caller own sub-school', async () => {
    const ourStudent = await createStudent(schoolA.subSchoolId);
    const ourClass = await createClass(schoolA.subSchoolId);

    const response = await request(app)
      .post('/api/enrollments')
      .set('Authorization', adminOf(schoolA))
      .send({ studentId: ourStudent.id, classId: ourClass.id })
      .expect(201);

    expect(response.body.data.studentId).toBe(ourStudent.id);
  });
});
