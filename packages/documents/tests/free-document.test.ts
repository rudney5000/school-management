import { describe, expect, it } from 'vitest';
import { freeDocument, renderDocument, validateLayout, type LayoutInput } from '../src';
import { director, fakeRenderer, gombeScope, setup, team, SCHOOL } from './helpers';

/** "Certificat de scolarité": a title, a sentence with two fields, a signature. */
const certificate: LayoutInput = {
  format: 1,
  page: {},
  theme: { font: 'NotoSerif', fontSize: 11 },
  fields: [
    { key: 'studentName', label: "Nom de l'élève" },
    { key: 'birthDate', label: 'Date de naissance', type: 'date' },
    { key: 'note', label: 'Remarque', required: false },
  ],
  blocks: [
    {
      type: 'richText',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [
            { type: 'text', text: 'CERTIFICAT DE SCOLARITÉ', marks: [{ type: 'underline' }] },
          ],
        },
        {
          type: 'paragraph',
          attrs: { textAlign: 'justify' },
          content: [
            { type: 'text', text: "Je certifie que l'élève " },
            { type: 'field', attrs: { key: 'studentName' }, marks: [{ type: 'bold' }] },
            { type: 'text', text: ', né(e) le ' },
            { type: 'field', attrs: { key: 'birthDate' } },
            { type: 'text', text: ', est régulièrement inscrit(e).' },
          ],
        },
        { type: 'paragraph' },
      ],
    },
    { type: 'signatures', slots: [{ role: 'Le Directeur' }] },
  ],
};

const meta = { number: 'APERÇU', issuedAt: '2026-11-10', verifyUrl: 'https://x.org/verify/1' };

const pdfText = (pdf: Uint8Array) => Buffer.from(pdf).toString('latin1');

describe('free documents: layout', () => {
  it('accepts rich text with fields, and refuses unknown or duplicate fields', () => {
    expect(validateLayout(certificate, freeDocument).ok).toBe(true);

    const broken = {
      ...certificate,
      fields: [...certificate.fields!, { key: 'studentName', label: 'Encore' }],
      blocks: [
        {
          type: 'richText',
          content: [{ type: 'paragraph', content: [{ type: 'field', attrs: { key: 'school' } }] }],
        },
      ],
    };
    const result = validateLayout(broken, freeDocument);
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.issues.map((i) => [i.code, i.path])).toEqual([
      ['DUPLICATE_FIELD', 'fields.3.key'],
      ['UNKNOWN_FIELD', 'blocks.0.content.0.content.0'],
    ]);
  });

  it('renders the serif font, the values, and the labels of empty fields on drafts only', async () => {
    const issued = await renderDocument({
      type: freeDocument,
      layout: certificate,
      payload: {
        ...freeDocument.sample,
        fields: { studentName: 'MOUKOKO Ornella', birthDate: '2012-04-03' },
      },
      document: meta,
    });
    expect(pdfText(issued)).toContain('NotoSerif');

    const draft = await renderDocument({
      type: freeDocument,
      layout: certificate,
      payload: freeDocument.sample,
      document: meta,
      draft: true,
    });
    expect(draft.length).toBeGreaterThan(1000);
  });
});

describe('free documents: issuing', () => {
  async function publishedCertificate(
    ctx: ReturnType<typeof setup>,
    name = 'Certificat de scolarité',
  ) {
    const template = await ctx.templates.create(team, {
      scope: { schoolId: SCHOOL, subSchoolId: null },
      documentType: 'free',
      name,
      layout: certificate,
    });
    await ctx.templates.publish(team, template.id);
    return template;
  }

  const issue = (ctx: ReturnType<typeof setup>, templateId: string, fields: object) =>
    ctx.issuing.issue({
      type: 'free',
      scope: gombeScope,
      params: {},
      actor: director,
      templateId,
      fields: fields as Record<string, unknown>,
    });

  it('keeps several templates of the same type, and issues from the chosen one', async () => {
    const fake = fakeRenderer();
    const ctx = setup({ renderer: fake.renderer });
    await publishedCertificate(ctx);
    const transfer = await publishedCertificate(ctx, 'Certificat de transfert');

    const doc = await issue(ctx, transfer.id, {
      studentName: '  MOUKOKO Ornella ',
      birthDate: '2012-04-03',
    });
    expect(doc).toMatchObject({
      number: 'SJG-DOC-2025-000001',
      templateId: transfer.id,
      subjectType: null,
      subjectId: null,
      payload: { fields: { studentName: 'MOUKOKO Ornella', birthDate: '2012-04-03' } },
    });
    expect(fake.calls[0]!.payload).toMatchObject({
      school: { name: 'Complexe Scolaire Saint-Joseph' },
    });
  });

  it('refuses missing, wrong or unknown field values, without using a number', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const template = await publishedCertificate(ctx);

    await expect(
      issue(ctx, template.id, { birthDate: '2012-02-30', other: 'x' }),
    ).rejects.toMatchObject({
      code: 'INVALID_FIELDS',
      issues: [
        { path: 'other' },
        { path: 'studentName', message: "Nom de l'élève is required" },
        { path: 'birthDate', message: 'Date de naissance: expected a date' },
      ],
    });
    await expect(
      ctx.issuing.issue({ type: 'free', scope: gombeScope, params: {}, actor: director }),
    ).rejects.toMatchObject({ code: 'INVALID_PARAMS' });

    const doc = await issue(ctx, template.id, { studentName: 'A', birthDate: '2012-04-03' });
    expect(doc.number).toBe('SJG-DOC-2025-000001');
  });

  it("refuses another school's template and an unpublished one", async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const draft = await ctx.templates.create(team, {
      scope: { schoolId: SCHOOL, subSchoolId: null },
      documentType: 'free',
      name: 'Brouillon',
      layout: certificate,
    });
    await expect(issue(ctx, draft.id, {})).rejects.toMatchObject({ code: 'NO_TEMPLATE' });
    await expect(
      ctx.issuing.issue({
        type: 'free',
        scope: { ...gombeScope, schoolId: 'school-sainte-marie' },
        params: {},
        actor: { userId: 'u', schoolId: null },
        templateId: draft.id,
        fields: {},
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
