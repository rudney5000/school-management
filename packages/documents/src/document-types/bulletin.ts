import { z } from 'zod';
import { defineDocumentType } from './define';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

export const bulletinPayload = z
  .object({
    school: z
      .object({
        name: z.string().min(1),
        code: z.string().min(1),
        city: z.string().min(1),
        /** Head of the school, printed under the signature. */
        headName: z.string().nullable(),
      })
      .strict(),
    student: z
      .object({
        fullName: z.string().min(1),
        birthDate: isoDate.nullable(),
        gender: z.enum(['M', 'F']).nullable(),
        matricule: z.string().nullable(),
      })
      .strict(),
    class: z.object({ name: z.string().min(1), level: z.string().min(1) }).strict(),
    period: z.object({ name: z.string().min(1), schoolYear: z.string().min(1) }).strict(),
    rows: z
      .array(
        z
          .object({
            course: z.string().min(1),
            /** null when the student has no grade for this course. */
            score: z.number().min(0).nullable(),
            max: z.number().positive(),
            coefficient: z.number().positive(),
          })
          .strict()
          .refine((row) => row.score === null || row.score <= row.max, 'score above max'),
      )
      .min(1),
    totals: z
      .object({
        obtained: z.number().min(0),
        max: z.number().positive(),
        percent: z.number().min(0).max(100),
      })
      .strict(),
    rank: z
      .object({ position: z.number().int().positive(), of: z.number().int().positive() })
      .strict()
      .nullable(),
    mention: z.string().nullable(),
    decision: z.string().nullable(),
  })
  .strict();

export type BulletinPayload = z.infer<typeof bulletinPayload>;

const sampleRows = [
  { course: 'Mathématiques', score: 34, max: 40, coefficient: 4 },
  { course: 'Français', score: 31, max: 40, coefficient: 4 },
  { course: 'Physique-Chimie', score: 26, max: 40, coefficient: 3 },
  { course: 'Biologie', score: 28, max: 40, coefficient: 3 },
  { course: 'Histoire-Géographie', score: 15, max: 20, coefficient: 2 },
  { course: 'Anglais', score: 16, max: 20, coefficient: 2 },
  { course: 'Éducation Civique', score: 17, max: 20, coefficient: 1 },
  { course: 'Informatique', score: 18, max: 20, coefficient: 1 },
  { course: 'Religion', score: 9, max: 10, coefficient: 1 },
  { course: 'Éducation Physique', score: 8, max: 10, coefficient: 1 },
  { course: 'Dessin', score: null, max: 10, coefficient: 1 },
  { course: 'Lingala', score: 14, max: 20, coefficient: 1 },
];

export const bulletin = defineDocumentType({
  key: 'bulletin',
  subject: 'student',
  oneTemplatePerScope: true,
  params: z
    .object({
      studentId: z.string().uuid(),
      classId: z.string().uuid(),
      academicPeriodId: z.string().uuid(),
    })
    .strict(),
  payload: bulletinPayload,
  payloadVersion: 1,
  blocks: [
    'header',
    'title',
    'text',
    'richText',
    'infoGrid',
    'image',
    'spacer',
    'gradesTable',
    'signatures',
    'qrVerify',
    'watermark',
  ],
  requiredBlocks: ['gradesTable'],
  numbering: { prefix: 'BUL', period: 'schoolYear' },
  schoolYearOf: (payload) => payload.period.schoolYear,
  periodOf: (payload) => `${payload.period.schoolYear} ${payload.period.name}`,
  publicView: (payload) => ({
    schoolName: payload.school.name,
    holderName: payload.student.fullName,
  }),
  sample: {
    school: {
      name: 'Complexe Scolaire Saint-Joseph',
      code: 'SJG',
      city: 'Kinshasa',
      headName: 'Jean-Pierre Lukusa',
    },
    student: {
      fullName: 'Marie Kabila Mbuyi',
      birthDate: '2011-03-12',
      gender: 'F',
      matricule: 'SJG-2019-0457',
    },
    class: { name: '1ère Année Secondaire A', level: 'Secondaire' },
    period: { name: '1er Trimestre', schoolYear: '2025-2026' },
    rows: sampleRows,
    totals: { obtained: 216, max: 290, percent: 74.5 },
    rank: { position: 4, of: 38 },
    mention: 'Distinction',
    decision: 'Admise',
  },
});
