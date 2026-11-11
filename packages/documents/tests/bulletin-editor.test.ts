import { describe, expect, it } from 'vitest';
import {
  bulletin,
  bulletinOfficielRdc,
  freeDocument,
  renderDocument,
  validateLayout,
  variablesOf,
  type LayoutInput,
} from '../src';

const meta = {
  number: 'SJG-BUL-2025-2026-000001',
  issuedAt: '2026-01-15',
  verifyUrl: 'https://example.test/verify/1',
};

/** A bulletin built in the editor: free text with variables around the grades table. */
const edited: LayoutInput = {
  ...bulletinOfficielRdc.layout,
  blocks: [
    {
      type: 'richText',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: 'BULLETIN SCOLAIRE' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Élève : ' },
            { type: 'variable', attrs: { path: 'student.fullName' }, marks: [{ type: 'bold' }] },
            { type: 'text', text: ', née le ' },
            { type: 'variable', attrs: { path: 'student.birthDate' } },
          ],
        },
      ],
    },
    { type: 'gradesTable', columns: ['course', 'score', 'max'] },
    {
      type: 'richText',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Pourcentage : ' },
            { type: 'variable', attrs: { path: 'totals.percent' } },
          ],
        },
      ],
    },
  ],
};

describe('bulletin built in the editor', () => {
  it('accepts rich text with variables around the grades table', () => {
    expect(validateLayout(edited, bulletin).issues).toEqual([]);
  });

  it('renders it with the sample payload', async () => {
    const pdf = await renderDocument({
      type: bulletin,
      layout: edited,
      payload: bulletin.sample,
      document: meta,
    });
    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe('%PDF-');
  });

  it('rejects a variable that is not in the payload', () => {
    const layout = structuredClone(edited) as { blocks: { content?: unknown[] }[] };
    (layout.blocks[0]!.content![1] as { content: unknown[] }).content.push({
      type: 'variable',
      attrs: { path: 'student.nickname' },
    });
    const result = validateLayout(layout, bulletin);
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'UNKNOWN_VARIABLE', path: 'blocks.0.content.1.content.4' }),
    ]);
  });

  it('rejects a variable pointing to a list', () => {
    const layout = structuredClone(edited) as { blocks: { content?: unknown[] }[] };
    (layout.blocks[2]!.content![0] as { content: unknown[] }).content.push({
      type: 'variable',
      attrs: { path: 'rows' },
    });
    expect(validateLayout(layout, bulletin).issues[0]?.code).toBe('UNKNOWN_VARIABLE');
  });

  it('refuses typed fields: a bulletin is filled from the modules', () => {
    const result = validateLayout(
      { ...edited, fields: [{ key: 'note', label: 'Note' }] },
      bulletin,
    );
    expect(result.issues.map((issue) => issue.code)).toEqual(['FIELDS_NOT_ALLOWED']);
  });
});

describe('variables of a free document', () => {
  it('offers the school and the document, not the typed values', () => {
    const paths = variablesOf(freeDocument).map((v) => v.path);
    expect(paths).toContain('school.name');
    expect(paths).toContain('document.number');
    expect(paths).not.toContain('fields');
  });

  it('refuses a variable on the typed values', () => {
    const layout: LayoutInput = {
      format: 1,
      page: {},
      theme: {},
      blocks: [
        {
          type: 'richText',
          content: [
            { type: 'paragraph', content: [{ type: 'variable', attrs: { path: 'fields' } }] },
          ],
        },
      ],
    };
    expect(validateLayout(layout, freeDocument).issues[0]?.code).toBe('UNKNOWN_VARIABLE');
  });
});
