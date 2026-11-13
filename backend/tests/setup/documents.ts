import request from 'supertest';
import type { FileStore } from '@school-hub/documents';
import { createApp } from '@/app';
import { db } from '@/db';
import { academicPeriods, classCourses, courses, grades } from '@/db/schema';
import { bearer } from './auth';
import { createClass, createEnrollment, createStudent, createUser, type Tenant } from './factories';

const app = createApp();

/** Stands in for S3: the bytes stay in memory. */
export class MemoryFiles implements FileStore {
  readonly objects = new Map<string, Uint8Array>();
  async put(key: string, bytes: Uint8Array) {
    this.objects.set(key, bytes);
  }
  async get(key: string) {
    const bytes = this.objects.get(key);
    if (!bytes) throw new Error(`No object ${key}`);
    return bytes;
  }
}

export async function directorOf(tenant: Tenant) {
  const user = await createUser('director');
  return bearer({
    id: user.id,
    email: user.email ?? undefined,
    role: 'director',
    schoolId: tenant.schoolId,
    subSchoolId: tenant.subSchoolId,
  });
}

/** A class of three students, two courses, every grade entered. */
export async function classWithGrades(tenant: Tenant) {
  const klass = await createClass(tenant.subSchoolId);
  const [period] = await db
    .insert(academicPeriods)
    .values({
      subSchoolId: tenant.subSchoolId,
      name: '1er Trimestre',
      type: 'trimester',
      startDate: new Date('2025-09-08'),
      endDate: new Date('2025-12-19'),
    })
    .returning();
  const subjects = await db
    .insert(courses)
    .values([
      { name: 'Mathématiques', code: 'MATH', subSchoolId: tenant.subSchoolId },
      { name: 'Français', code: 'FR', subSchoolId: tenant.subSchoolId },
    ])
    .returning();
  await db
    .insert(classCourses)
    .values(subjects.map((course) => ({ classId: klass.id, courseId: course.id })));

  // Percentages: 75, 50, 75 — the first and the last share the first place.
  const scores = [
    [30, 15],
    [20, 10],
    [32, 13],
  ];
  const students = [];
  for (const [math, french] of scores) {
    const student = await createStudent(tenant.subSchoolId);
    await createEnrollment(student.id, klass.id);
    await db.insert(grades).values([
      {
        studentId: student.id,
        courseId: subjects[0]!.id,
        classId: klass.id,
        academicPeriodId: period!.id,
        subSchoolId: tenant.subSchoolId,
        gradeType: 'exam',
        score: String(math),
        maxScore: '40',
        coefficient: '4',
      },
      {
        studentId: student.id,
        courseId: subjects[1]!.id,
        classId: klass.id,
        academicPeriodId: period!.id,
        subSchoolId: tenant.subSchoolId,
        gradeType: 'exam',
        score: String(french),
        maxScore: '20',
        coefficient: '2',
      },
    ]);
    students.push(student);
  }
  return { klass, period: period!, students };
}

export async function publishedStarter(token: string) {
  const created = await request(app)
    .post('/api/documents/templates')
    .set('Authorization', token)
    .send({ documentType: 'bulletin', name: 'Bulletin officiel', starter: 'bulletin-officiel-rdc' })
    .expect(201);
  await request(app)
    .post(`/api/documents/templates/${created.body.data.id}/publish`)
    .set('Authorization', token)
    .send({ note: 'Première version' })
    .expect(201);
  return created.body.data as { id: string };
}

export const issueBody = (
  data: Awaited<ReturnType<typeof classWithGrades>>,
  student = data.students[0]!,
) => ({
  type: 'bulletin',
  params: { studentId: student.id, classId: data.klass.id, academicPeriodId: data.period.id },
});
