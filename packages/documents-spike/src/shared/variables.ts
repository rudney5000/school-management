/**
 * Minimal `{{path|formatter:arg}}` resolver, as described in §6 of the design
 * document. Both engines go through it so the templates stay engine agnostic
 * on the variable side.
 */

type Formatter = (value: unknown, arg?: string) => string;

const formatters: Record<string, Formatter> = {
  date: (v) => {
    const [y, m, d] = String(v).split('-');
    return d && m && y ? `${d}/${m}/${y}` : String(v);
  },
  upper: (v) => String(v).toUpperCase(),
  default: (v, arg) => (v === null || v === undefined || v === '' ? (arg ?? '') : String(v)),
  number: (v) => (typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v)),
};

function lookup(payload: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
}

export function resolve(
  text: string,
  payload: unknown,
  escape: (s: string) => string = (s) => s,
): string {
  return text.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr: string) => {
    const [path, ...pipes] = expr.split('|').map((p) => p.trim());
    let value: unknown = lookup(payload, path!);
    let out: string | undefined;
    for (const pipe of pipes) {
      const [name, arg] = pipe.split(':');
      const fn = formatters[name!];
      if (!fn) throw new Error(`UNKNOWN_FORMATTER: ${name}`);
      out = fn(out ?? value, arg);
      value = out;
    }
    if (out === undefined) {
      if (value === undefined) throw new Error(`UNKNOWN_VARIABLE: ${path}`);
      out = value === null ? '' : String(value);
    }
    return escape(out);
  });
}

export const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function formatScore(score: number | null): string {
  return score === null ? '—' : String(score);
}
