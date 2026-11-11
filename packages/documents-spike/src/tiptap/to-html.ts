import { generateHTML } from '@tiptap/html';
import type { JSONContent } from '@tiptap/core';
import QRCode from 'qrcode';
import { extensions, type BlockName } from './extensions.ts';
import { escapeHtml, formatScore, resolve } from '../shared/variables.ts';
import { fontFiles } from '../shared/fonts.ts';
import type { GradeRow } from '../shared/fixtures.ts';

type BlockConfig = Record<string, unknown>;
type BlockRenderer = (config: BlockConfig, payload: Record<string, unknown>) => Promise<string>;

const text = (value: unknown, payload: unknown) =>
  resolve(String(value ?? ''), payload, escapeHtml);

const blocks: Record<BlockName, BlockRenderer> = {
  async schoolHeader(config, payload) {
    const lines = (config.lines as string[]).map(
      (l) => `<div class="line">${text(l, payload)}</div>`,
    );
    return `<header class="school-header ${String(config.variant)}">
      ${lines.join('')}
      <div class="title">${text(config.title, payload)}</div>
      <div class="subtitle">${text(config.subtitle, payload)}</div>
    </header>`;
  },

  async gradesTable(config, payload) {
    const head = (config.columns as string[]).map((c) => `<th>${escapeHtml(c)}</th>`).join('');
    const rows = (payload.rows as GradeRow[])
      .map(
        (r) => `<tr>
          <td>${escapeHtml(r.course)}</td>
          <td class="num">${formatScore(r.score)}</td>
          <td class="num">${r.max}</td>
          <td class="center">${r.coefficient}</td>
          <td class="num">${r.score === null ? '—' : r.score * r.coefficient}</td>
        </tr>`,
      )
      .join('');
    return `<table class="grades"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
  },

  async signatures(config, payload) {
    const place = config.place ? `<div class="place">${text(config.place, payload)}</div>` : '';
    return `<div class="signatures">${place}
      <div class="signer">
        <div class="role">${text(config.role, payload)}</div>
        <div class="rule"></div>
        <div class="name">${text(config.name, payload)}</div>
      </div>
    </div>`;
  },

  async qrVerify(config, payload) {
    const url = resolve(String(config.url), payload);
    const svg = await QRCode.toString(url, { type: 'svg', margin: 0 });
    const caption = (config.caption as string[]).map((c) => text(c, payload)).join('<br>');
    return `<div class="qr-verify"><div class="qr">${svg}</div><div class="caption">${caption}</div></div>`;
  },
};

const BLOCK_TAG = /<div data-block="(\w+)" data-config="([^"]*)"><\/div>/g;

const unescapeAttr = (s: string) =>
  s
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/**
 * Blocks are cut out before the variables of the surrounding text are
 * resolved, so a value never ends up inside a block's JSON config.
 */
async function renderBody(html: string, payload: Record<string, unknown>): Promise<string> {
  const matches = [...html.matchAll(BLOCK_TAG)];
  const rendered = await Promise.all(
    matches.map(([, name, config]) =>
      blocks[name as BlockName](JSON.parse(unescapeAttr(config!)), payload),
    ),
  );
  const slots = html.split(BLOCK_TAG);
  // split() with two capture groups yields [text, name, config, text, name, config, …, text]
  let out = '';
  for (let i = 0, b = 0; i < slots.length; i += 3, b++) {
    out += resolve(slots[i]!, payload, escapeHtml);
    if (b < rendered.length) out += rendered[b];
  }
  return out;
}

const CSS = `
@font-face { font-family: 'NotoSans'; font-weight: 400; src: url('${fontFiles.regular.name}'); }
@font-face { font-family: 'NotoSans'; font-weight: 700; src: url('${fontFiles.bold.name}'); }
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { font-family: 'NotoSans', sans-serif; font-size: 9.5pt; color: #1a1a1a; }
.page { width: 210mm; min-height: 297mm; padding: 0 12mm 12mm; position: relative; }
p { margin: 0 0 2.2mm; }
strong { font-weight: 700; }

.school-header { text-align: center; }
.school-header.band { background: #1e3a5f; color: #fff; margin: 0 -12mm; padding: 6mm 12mm 3mm; }
.school-header.band .line { font-size: 8pt; line-height: 1.5; }
.school-header.band .title { font-size: 15pt; font-weight: 700; margin-top: 1mm; }
.school-header.band .subtitle { color: #c9a227; font-size: 10pt; margin-top: 1mm; }
.school-header.plain { padding-top: 12mm; border-bottom: 0.6mm solid #c9a227; padding-bottom: 3mm; margin: 0 8mm 9mm; }
.school-header.plain .line:first-child { font-weight: 700; font-size: 9pt; }
.school-header.plain .line { font-size: 8.5pt; line-height: 1.5; }
.school-header.plain .title { color: #1e3a5f; font-size: 13pt; font-weight: 700; margin-top: 1.5mm; }
.school-header.plain .subtitle { color: #6b7280; font-size: 8.5pt; }

.page > table:not(.grades) { width: calc(100% + 24mm); margin: 0 -12mm 6mm; background: #f8f9fb; border-collapse: collapse; }
.page > table:not(.grades) td { width: 50%; padding: 1mm 12mm; vertical-align: top; }
.page > table:not(.grades) td:first-child { padding-top: 4mm; }
.page > table:not(.grades) tr:first-child td { padding-top: 4mm; }
.page > table:not(.grades) tr:last-child td { padding-bottom: 4mm; }
.page > table:not(.grades) p { margin: 0; }

table.grades { width: 100%; border-collapse: collapse; margin-bottom: 7mm; font-size: 9pt; border: 0.3mm solid #e5e7eb; }
table.grades th { background: #1e3a5f; color: #fff; text-align: left; padding: 2.2mm 2.5mm; }
table.grades td { padding: 2.2mm 2.5mm; border-bottom: 0.2mm solid #e5e7eb; }
table.grades tbody tr:nth-child(odd) { background: #f8f9fb; }
table.grades th:nth-child(1) { width: 40%; }
table.grades .num, table.grades th:nth-child(2), table.grades th:nth-child(3), table.grades th:nth-child(5) { text-align: right; }
table.grades .center, table.grades th:nth-child(4) { text-align: center; }

.signatures { margin-top: 12mm; display: flex; justify-content: flex-end; flex-direction: column; align-items: flex-end; }
.signatures .place { width: 80mm; text-align: center; font-size: 10pt; }
.signatures .signer { width: 70mm; text-align: center; margin-top: 2mm; }
.signatures .role { color: #6b7280; font-size: 9pt; }
.signatures .rule { border-top: 0.3mm solid #6b7280; margin: 14mm 0 1mm; }
.signatures .name { font-weight: 700; font-size: 10pt; }

.qr-verify { position: absolute; left: 12mm; bottom: 18mm; display: flex; align-items: center; gap: 4mm; }
.qr-verify .qr svg { width: 26mm; height: 26mm; display: block; }
.qr-verify .caption { color: #6b7280; font-size: 7.5pt; line-height: 1.3; }

h1 { color: #1e3a5f; font-size: 17pt; letter-spacing: 0.3mm; margin: 0 0 1mm; }
.page.certificate { padding: 0 20mm 12mm; }
.page.certificate p[style*="justify"] { font-size: 10pt; line-height: 1.4; margin-bottom: 3.5mm; }
.page.certificate p[style*="center"] { color: #6b7280; font-size: 9pt; margin-bottom: 9mm; }
.page.certificate .signatures { margin-top: 6mm; }
.page.certificate .qr-verify { left: 20mm; flex-direction: column; align-items: flex-start; gap: 2mm; }
.page.certificate .qr-verify .qr svg { width: 28mm; height: 28mm; }
`;

/** TipTap JSON + payload -> a full HTML page ready for Chromium. */
export async function toHtml(
  doc: JSONContent,
  payload: Record<string, unknown>,
  pageClass: string,
): Promise<string> {
  const html = await renderBody(generateHTML(doc, extensions), payload);
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${CSS}</style></head>
<body><div class="page ${pageClass}">${html}</div></body></html>`;
}

/** `**bold**` source text -> TipTap paragraph JSON, so the certificate body is authored once. */
export function paragraphNode(source: string): JSONContent {
  const content: JSONContent[] = source
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith('**')
        ? { type: 'text', marks: [{ type: 'bold' }], text: part.slice(2, -2) }
        : { type: 'text', text: part },
    );
  return { type: 'paragraph', attrs: { textAlign: 'justify' }, content };
}
