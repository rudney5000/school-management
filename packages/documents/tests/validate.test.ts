import { describe, expect, it } from 'vitest';
import {
  bulletin,
  bulletinOfficielRdc,
  validateLayout,
  variablesOf,
  type LayoutInput,
} from '../src';

const base = (blocks: unknown[]): LayoutInput =>
  ({ format: 1, page: { size: 'A4' }, theme: {}, blocks }) as LayoutInput;
const grades = { type: 'gradesTable', columns: ['course', 'score'] };
const codes = (layout: unknown, assetIds?: Set<string>) => {
  const result = validateLayout(layout, bulletin, { assetIds });
  return result.ok ? [] : result.issues.map((i) => `${i.code} ${i.path}`);
};

describe('validateLayout', () => {
  it('accepts the starter template and fills in the defaults', () => {
    const result = validateLayout(bulletinOfficielRdc.layout, bulletin);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.layout.page.margins.left).toBe(14);
  });

  it('reports an unknown block by name, not as a vague union error', () => {
    expect(codes(base([grades, { type: 'chart' }]))).toEqual(['UNKNOWN_BLOCK blocks.1.type']);
  });

  it('rejects a misspelled property', () => {
    expect(codes(base([grades, { type: 'title', text: 'Bulletin', colour: 'accent' }]))).toEqual([
      'INVALID_LAYOUT blocks.1',
    ]);
  });

  it('checks every variable against the payload of the type', () => {
    const layout = base([
      grades,
      {
        type: 'text',
        text: '{{student.fullName}} {{student.lastName}} {{rows}} {{student}} {{document.number}} {{totals.percent|pct}}',
      },
    ]);
    expect(codes(layout)).toEqual([
      'UNKNOWN_VARIABLE blocks.1.text',
      'UNKNOWN_VARIABLE blocks.1.text',
      'UNKNOWN_VARIABLE blocks.1.text',
      'UNKNOWN_FORMATTER blocks.1.text',
    ]);
    const result = validateLayout(layout, bulletin);
    expect(result.ok ? [] : result.issues.map((i) => i.message)).toEqual([
      '{{student.lastName}}: no field student.lastName',
      '{{rows}}: rows is a list, use a dedicated block',
      '{{student}}: student is an object, pick one of its fields',
      '{{totals.percent|pct}}: unknown formatter |pct',
    ]);
  });

  it('requires the blocks the type cannot do without', () => {
    expect(codes(base([{ type: 'title', text: 'Bulletin' }]))).toEqual([
      'REQUIRED_BLOCK_MISSING blocks',
    ]);
  });

  it('only accepts assets that belong to the school', () => {
    const mine = '8f2c0d6e-1111-4222-8333-944455556666';
    const other = '91ab0d6e-1111-4222-8333-944455556666';
    const layout = base([
      grades,
      { type: 'header', logo: `asset:${mine}`, lines: [{ text: 'x' }] },
      { type: 'image', asset: `asset:${other}` },
    ]);
    expect(codes(layout, new Set([mine]))).toEqual(['UNKNOWN_ASSET blocks.2.asset']);
  });
});

describe('variablesOf', () => {
  it('lists the single values of the payload and document.*, never the lists', () => {
    const variables = variablesOf(bulletin);
    const byPath = new Map(variables.map((v) => [v.path, v]));
    expect(byPath.get('student.fullName')).toEqual({
      path: 'student.fullName',
      kind: 'text',
      nullable: false,
    });
    expect(byPath.get('student.birthDate')).toMatchObject({ kind: 'date', nullable: true });
    expect(byPath.get('totals.percent')).toMatchObject({ kind: 'number' });
    expect(byPath.get('document.issuedAt')).toMatchObject({ kind: 'date' });
    expect(byPath.has('rows')).toBe(false);
    expect(byPath.has('student')).toBe(false);
  });

  it('only lists variables that validation accepts', () => {
    for (const { path } of variablesOf(bulletin)) {
      const layout = {
        ...bulletinOfficielRdc.layout,
        blocks: [{ type: 'text', text: `{{${path}}}` }, ...bulletinOfficielRdc.layout.blocks],
      };
      expect(validateLayout(layout, bulletin).ok, path).toBe(true);
    }
  });
});
