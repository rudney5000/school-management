/**
 * The editor shows the page filled with the type's sample data, like the PDF
 * preview. These helpers mirror the engine's formatters (packages/documents,
 * engine/variables.ts) closely enough for the screen; the PDF stays the
 * reference.
 */

export interface VariableInfo {
  /** As written in a template: `student.fullName`, `document.issuedAt`. */
  path: string;
  kind: 'text' | 'number' | 'date';
  nullable: boolean;
}

const VARIABLE = /\{\{\s*([^{}]+?)\s*\}\}/g;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

export function lookup(data: unknown, path: string): unknown {
  let node: unknown = data;
  for (const key of path.split('.')) {
    if (node === null || typeof node !== 'object' || !(key in node)) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/** 74.5 → "74,5"; 150000 → "150 000". */
export function formatNumber(n: number): string {
  const [int, dec] = String(Math.round(Math.abs(n) * 100) / 100).split('.');
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${n < 0 ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

export function formatDate(value: string): string {
  const match = ISO_DATE.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
}

const FORMATTERS: Record<string, (value: unknown, arg?: string) => unknown> = {
  date: (v) => (isEmpty(v) ? v : formatDate(String(v))),
  number: (v) => (isEmpty(v) || Number.isNaN(Number(v)) ? v : formatNumber(Number(v))),
  money: (v, currency) =>
    isEmpty(v) || Number.isNaN(Number(v)) ? v : `${formatNumber(Number(v))} ${currency || 'FC'}`,
  upper: (v) => (isEmpty(v) ? v : String(v).toUpperCase()),
  default: (v, fallback) => (isEmpty(v) ? (fallback ?? '') : v),
  // Spelled-out numbers are left to the PDF.
  words: (v) => v,
};

/** `{{student.birthDate|date}}` → `12/03/2011`. An unknown variable stays as written. */
export function interpolate(text: string, data: unknown): string {
  return text.replace(VARIABLE, (raw, inner: string) => {
    const [path = '', ...pipes] = inner.split('|').map((part) => part.trim());
    let value = lookup(data, path);
    if (value === undefined) return raw;
    for (const pipe of pipes) {
      const colon = pipe.indexOf(':');
      const name = colon === -1 ? pipe : pipe.slice(0, colon).trim();
      const arg = colon === -1 ? undefined : pipe.slice(colon + 1);
      value = FORMATTERS[name]?.(value, arg) ?? value;
    }
    return isEmpty(value) ? '' : String(value);
  });
}

/** A variable node of the rich text, as the engine prints it (blocks/RichText.tsx). */
export function variableText(path: string, data: unknown): string {
  const raw = lookup(data, path);
  if (isEmpty(raw)) return '—';
  if (typeof raw === 'number') return formatNumber(raw);
  if (typeof raw === 'string' && ISO_DATE.test(raw)) return formatDate(raw);
  return String(raw);
}

/** Translation key of a variable's label: `student.fullName` → `templateEditor.variables.student_fullName`. */
export const variableLabelKey = (path: string) =>
  `templateEditor.variables.${path.replace(/\./g, '_')}`;

/** The groups shown in the "Insert data" menu, in this order. */
export const VARIABLE_GROUPS = [
  'student',
  'class',
  'period',
  'totals',
  'rank',
  'school',
  'document',
];

export const groupOf = (path: string) => {
  const head = path.split('.')[0]!;
  return VARIABLE_GROUPS.includes(head) ? head : 'other';
};

/** The engine adds `document.verifyUrl` for the QR code; it is never printed as text. */
export const insertableVariables = (variables: VariableInfo[]) =>
  variables.filter((v) => v.path !== 'document.verifyUrl');
