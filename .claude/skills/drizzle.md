# Skill — Drizzle ORM

> Patterns à suivre pour ce projet.

## Définir une table

```typescript
// backend/src/db/schema/students.ts
import { pgTable, uuid, varchar, date, timestamp, boolean } from 'drizzle-orm/pg-core'
import { subSchools } from './schools'

export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  subSchoolId: uuid('sub_school_id').notNull().references(() => subSchools.id),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  birthDate: date('birth_date'),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'), // soft delete
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

## Requête avec filtre multi-tenant

```typescript
// Toujours filtrer par subSchoolId
const students = await db
  .select()
  .from(studentsTable)
  .where(
    and(
      eq(studentsTable.subSchoolId, subSchoolId),
      isNull(studentsTable.deletedAt) // exclure soft-deleted
    )
  )
```

## Relation avec join

```typescript
const studentsWithClass = await db
  .select({
    id: students.id,
    firstName: students.firstName,
    className: classrooms.name,
  })
  .from(students)
  .innerJoin(classrooms, eq(students.classroomId, classrooms.id))
  .where(eq(students.subSchoolId, subSchoolId))
```

## Transaction

```typescript
await db.transaction(async (tx) => {
  const [student] = await tx.insert(students).values(newStudent).returning()
  await tx.insert(enrollments).values({ studentId: student.id, classroomId })
})
```

## Soft delete

```typescript
// Ne jamais DELETE — toujours soft delete
await db
  .update(students)
  .set({ deletedAt: new Date() })
  .where(eq(students.id, studentId))
```
