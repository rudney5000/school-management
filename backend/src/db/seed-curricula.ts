import { and, eq, inArray } from 'drizzle-orm';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { db } from './index';
import { attachments, classes, courses, curricula, curriculumClasses, users } from './schema';
import { BUCKET_NAME, newUploadKey, s3Client, uploadKeyPrefix } from '@/config/storage';

type DemoCurriculum = {
  title: string;
  description: string;
  type: 'national' | 'school';
  courseCode?: string;
  classNames: string[];
  published: boolean;
  /** Lines of the demo PDF attached to it; no file when absent. */
  file?: { filename: string; lines: string[] };
};

const SCHOOL_YEAR = '2026-2027';

const DEMO: DemoCurriculum[] = [
  {
    title: 'Programme national de mathématiques — 1ère secondaire',
    description: 'Programme officiel du ministère, réparti sur les trois trimestres.',
    type: 'national',
    courseCode: 'MATH-01',
    classNames: ['1ère Année Secondaire A', '1ère Année Secondaire B'],
    published: true,
    file: {
      filename: 'Programme national - Mathématiques 1ère secondaire.pdf',
      lines: [
        'PROGRAMME NATIONAL DE MATHÉMATIQUES',
        '1ère année secondaire — 2026-2027',
        '',
        'Trimestre 1 : nombres entiers, fractions, puissances',
        'Trimestre 2 : équations du premier degré, proportionnalité',
        'Trimestre 3 : géométrie plane, aires et périmètres',
        '',
        'Document de démonstration EcoLinga.',
      ],
    },
  },
  {
    title: 'Programme national de français — 1ère secondaire',
    description: 'Grammaire, conjugaison, expression écrite et lecture suivie.',
    type: 'national',
    courseCode: 'FR-01',
    classNames: ['1ère Année Secondaire A', '1ère Année Secondaire B'],
    published: true,
    file: {
      filename: 'Programme national - Français 1ère secondaire.pdf',
      lines: [
        'PROGRAMME NATIONAL DE FRANÇAIS',
        '1ère année secondaire — 2026-2027',
        '',
        'Grammaire : la phrase, les classes de mots',
        'Conjugaison : présent, passé composé, imparfait',
        'Expression : le récit, la lettre',
        '',
        'Document de démonstration EcoLinga.',
      ],
    },
  },
  {
    title: "Programme d'informatique de l'école",
    description: "Programme propre à l'école : bureautique et initiation au numérique.",
    type: 'school',
    courseCode: 'INFO-01',
    classNames: [
      '1ère Année Secondaire A',
      '1ère Année Secondaire B',
      '2ème Année Secondaire A',
      '3ème Année Secondaire A',
    ],
    published: true,
    file: {
      filename: "Programme d'informatique.pdf",
      lines: [
        "PROGRAMME D'INFORMATIQUE DE L'ÉCOLE",
        'Toutes les classes du secondaire — 2026-2027',
        '',
        "Prise en main de l'ordinateur et du clavier",
        'Traitement de texte et tableur',
        'Internet : recherche et sécurité',
        '',
        'Document de démonstration EcoLinga.',
      ],
    },
  },
  {
    // A draft, so the director sees one that parents and teachers do not.
    title: 'Programme national de physique — 3ème secondaire (en préparation)',
    description: 'Brouillon : le fichier officiel sera ajouté avant publication.',
    type: 'national',
    courseCode: 'PC-01',
    classNames: ['3ème Année Secondaire A'],
    published: false,
  },
];

/** PDF string literal: Latin-1 for the built-in Helvetica, with ( ) \ and accents escaped. */
function pdfText(value: string): string {
  return [...value.replace(/—/g, '-')]
    .map((char) => {
      const code = char.charCodeAt(0);
      if (char === '(' || char === ')' || char === '\\') return `\\${char}`;
      if (code > 126) return `\\${(code & 0xff).toString(8).padStart(3, '0')}`;
      return char;
    })
    .join('');
}

/** A one-page A4 PDF listing `lines`, small enough to build by hand. */
function demoPdf(lines: string[]): Buffer {
  const content = [
    'BT',
    '/F1 13 Tf',
    '16 TL',
    '60 780 Td',
    ...lines.map((line, index) => `${index === 0 ? '' : 'T* '}(${pdfText(line)}) Tj`),
    'ET',
  ].join('\n');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(content, 'latin1')} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

  return Buffer.from(pdf, 'latin1');
}

/** Demo programmes for the sub-school: published ones with a PDF, and one draft. */
export async function seedCurricula(subSchoolId: string): Promise<void> {
  const [director] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'directeur@saintjoseph.cd'))
    .limit(1);

  for (const demo of DEMO) {
    const [existing] = await db
      .select({ id: curricula.id })
      .from(curricula)
      .where(and(eq(curricula.subSchoolId, subSchoolId), eq(curricula.title, demo.title)))
      .limit(1);

    if (existing) {
      console.log(`~ Curriculum already exists: ${demo.title}`);
      continue;
    }

    const linkedClasses = await db
      .select({ id: classes.id })
      .from(classes)
      .where(and(eq(classes.subSchoolId, subSchoolId), inArray(classes.name, demo.classNames)));

    if (linkedClasses.length === 0) {
      console.log(`⏭ No class found, curriculum skipped: ${demo.title}`);
      continue;
    }

    const [course] = demo.courseCode
      ? await db
          .select({ id: courses.id })
          .from(courses)
          .where(and(eq(courses.subSchoolId, subSchoolId), eq(courses.code, demo.courseCode)))
          .limit(1)
      : [];

    const [curriculum] = await db
      .insert(curricula)
      .values({
        subSchoolId,
        title: demo.title,
        description: demo.description,
        type: demo.type,
        courseId: course?.id,
        schoolYear: SCHOOL_YEAR,
        status: demo.published ? 'published' : 'draft',
        publishedAt: demo.published ? new Date() : null,
        createdBy: director?.id,
      })
      .returning();

    await db
      .insert(curriculumClasses)
      .values(linkedClasses.map((klass) => ({ curriculumId: curriculum.id, classId: klass.id })));

    if (demo.file) {
      const body = demoPdf(demo.file.lines);
      const key = newUploadKey(
        uploadKeyPrefix(subSchoolId, 'curriculum', curriculum.id),
        'application/pdf',
      );

      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: body,
          ContentType: 'application/pdf',
        }),
      );

      await db.insert(attachments).values({
        attachableType: 'curriculum',
        attachableId: curriculum.id,
        category: 'curriculum',
        key,
        filename: demo.file.filename,
        mimeType: 'application/pdf',
        size: body.length,
        uploadedBy: director?.id ?? curriculum.id,
        status: 'validated',
        validatedBy: director?.id,
        validatedAt: new Date(),
      });
    }

    console.log(
      `✓ Curriculum created: ${demo.title}${demo.published ? '' : ' (draft)'}${demo.file ? ' + PDF' : ''}`,
    );
  }
}
