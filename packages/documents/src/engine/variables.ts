import { DocumentError } from '../errors';
import { numberToWords, type WordsLocale } from './number-words';

/**
 * Variables inside template text: `{{student.fullName}}`, `{{student.birthDate|date}}`,
 * `{{payment.amount|money}}`, `{{mention|default:—}}`. There are no loops and no
 * conditions: repeated data is a dedicated block and conditional wording is
 * computed by the backend collector.
 */

export interface VariableRef {
  /** The full `{{…}}` text, as written in the template. */
  raw: string;
  path: string;
  formatters: Array<{ name: string; arg?: string }>;
}

const VARIABLE = /\{\{\s*([^{}]+?)\s*\}\}/g;

export function parseVariables(text: string): VariableRef[] {
  return [...text.matchAll(VARIABLE)].map((match) => {
    const [path = '', ...pipes] = match[1]!.split('|').map((part) => part.trim());
    return {
      raw: match[0],
      path,
      formatters: pipes.map((pipe) => {
        const colon = pipe.indexOf(':');
        return colon === -1
          ? { name: pipe }
          : { name: pipe.slice(0, colon).trim(), arg: pipe.slice(colon + 1) };
      }),
    };
  });
}

type Formatter = (value: unknown, arg: string | undefined) => unknown;

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

function requireNumber(value: unknown, formatter: string): number {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new DocumentError(
      'INVALID_FORMATTER_VALUE',
      `|${formatter} expects a number, got ${JSON.stringify(value)}`,
    );
  }
  return n;
}

/** Groups thousands with a narrow no-break space and keeps at most two decimals: 74.5 → 74,5. */
function groupThousands(n: number): string {
  const [int, dec] = String(Math.round(Math.abs(n) * 100) / 100).split('.');
  const grouped = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${n < 0 ? '-' : ''}${grouped}${dec ? `,${dec}` : ''}`;
}

export const FORMATTERS: Record<string, Formatter> = {
  /** `2011-03-12` or an ISO timestamp → `12/03/2011`. */
  date: (value) => {
    if (isEmpty(value)) return value;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) {
      throw new DocumentError(
        'INVALID_FORMATTER_VALUE',
        `|date expects YYYY-MM-DD, got ${JSON.stringify(value)}`,
      );
    }
    return `${match[3]}/${match[2]}/${match[1]}`;
  },
  /** `150000` → `150 000 FC`; `|money:USD` → `150 000 USD`. */
  money: (value, currency) =>
    isEmpty(value) ? value : `${groupThousands(requireNumber(value, 'money'))} ${currency || 'FC'}`,
  /** `1234.5` → `1 234,50`. */
  number: (value) => (isEmpty(value) ? value : groupThousands(requireNumber(value, 'number'))),
  /** `150000` → `cent cinquante mille` (`|words:fr`, `|words:en`). */
  words: (value, locale) => {
    if (isEmpty(value)) return value;
    const lang = (locale || 'fr') as WordsLocale;
    if (lang !== 'fr' && lang !== 'en') {
      throw new DocumentError('INVALID_FORMATTER_VALUE', `|words supports fr and en, not ${lang}`);
    }
    return numberToWords(requireNumber(value, 'words'), lang);
  },
  upper: (value) => (isEmpty(value) ? value : String(value).toUpperCase()),
  default: (value, fallback) => (isEmpty(value) ? (fallback ?? '') : value),
};

export const FORMATTER_NAMES = Object.keys(FORMATTERS);

/** Reads `a.b.c` in the payload; `undefined` means the path does not exist. */
export function lookup(payload: unknown, path: string): unknown {
  let node: unknown = payload;
  for (const key of path.split('.')) {
    if (node === null || typeof node !== 'object' || !(key in node)) return undefined;
    node = (node as Record<string, unknown>)[key];
  }
  return node;
}

/**
 * Replaces every variable of `text` with its formatted value. Templates are
 * validated before they are published, so a missing path here means the
 * payload and the template disagree: it fails instead of printing a blank.
 */
export function interpolate(text: string, payload: unknown): string {
  return text.replace(VARIABLE, (raw) => {
    const [ref] = parseVariables(raw);
    let value = lookup(payload, ref!.path);
    if (value === undefined) {
      throw new DocumentError('UNKNOWN_VARIABLE', `No value for {{${ref!.path}}}`);
    }
    for (const { name, arg } of ref!.formatters) {
      const formatter = FORMATTERS[name];
      if (!formatter) throw new DocumentError('UNKNOWN_FORMATTER', `Unknown formatter |${name}`);
      value = formatter(value, arg);
    }
    return value === null || value === undefined ? '' : String(value);
  });
}
