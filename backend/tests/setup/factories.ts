import bcrypt from 'bcryptjs';
import { db } from '@/db';
import {
  cities,
  countries,
  departments,
  districts,
  payments,
  schools,
  students,
  subSchools,
  users,
  workers,
} from '@/db/schema';

let sequence = 0;
const next = (): string => String(++sequence).padStart(3, '0');

export interface Tenant {
  schoolId: string;
  subSchoolId: string;
}

/** Builds the full country → department → city → district → school → sub-school chain. */
export async function createTenant(): Promise<Tenant> {
  const id = next();

  const [country] = await db
    .insert(countries)
    .values({ name: `Country ${id}`, code: id })
    .returning();

  const [department] = await db
    .insert(departments)
    .values({ name: `Department ${id}`, code: `D${id}`, countryId: country.id })
    .returning();

  const [city] = await db
    .insert(cities)
    .values({ name: `City ${id}`, departmentId: department.id })
    .returning();

  const [district] = await db
    .insert(districts)
    .values({ name: `District ${id}`, cityId: city.id })
    .returning();

  const [school] = await db
    .insert(schools)
    .values({ name: `School ${id}`, code: `SCH-${id}`, districtId: district.id })
    .returning();

  const [subSchool] = await db
    .insert(subSchools)
    .values({ name: `Sub-school ${id}`, code: `SUB-${id}`, schoolId: school.id })
    .returning();

  return { schoolId: school.id, subSchoolId: subSchool.id };
}

/** Adds another sub-school under an existing school. */
export async function createSubSchool(schoolId: string): Promise<string> {
  const id = next();

  const [subSchool] = await db
    .insert(subSchools)
    .values({ name: `Sub-school ${id}`, code: `SUB-${id}`, schoolId })
    .returning();

  return subSchool.id;
}

export async function createStudent(subSchoolId: string, overrides: { email?: string } = {}) {
  const id = next();

  const [student] = await db
    .insert(students)
    .values({
      firstName: `First${id}`,
      lastName: `Last${id}`,
      email: overrides.email ?? `student-${id}@test.local`,
      gender: 'male',
      dateOfBirth: '2010-01-01',
      enrollmentDate: '2024-09-01',
      subSchoolId,
    })
    .returning();

  return student;
}

export async function createWorker(subSchoolId: string) {
  const id = next();

  const [worker] = await db
    .insert(workers)
    .values({
      firstName: `Worker${id}`,
      lastName: `Last${id}`,
      email: `worker-${id}@test.local`,
      subSchoolId,
    })
    .returning();

  return worker;
}

type Role = (typeof users.$inferInsert)['role'];

export async function createUser(
  role: Role,
  links: { workerId?: string; teacherId?: string; studentId?: string; parentId?: string } = {},
  password = 'password123',
) {
  const id = next();

  const [user] = await db
    .insert(users)
    .values({
      email: `user-${id}@test.local`,
      password: await bcrypt.hash(password, 10),
      role,
      ...links,
    })
    .returning();

  return user;
}

/** Creates an admin backed by a worker record, so the JWT carries a real sub-school. */
export async function createAdminIn(subSchoolId: string) {
  const worker = await createWorker(subSchoolId);
  const user = await createUser('admin', { workerId: worker.id });

  return { user, worker };
}

export async function createPayment(studentId: string, amount = '100.00') {
  const [payment] = await db
    .insert(payments)
    .values({ studentId, amount, type: 'TUITION' })
    .returning();

  return payment;
}
