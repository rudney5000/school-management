import { generate } from '@pdfme/generator';
import type { Font, Template } from '@pdfme/common';
import { barcodes, line, rectangle, table, text } from '@pdfme/schemas';
import { loadFonts } from '../shared/fonts.ts';
import { formatScore, resolve } from '../shared/variables.ts';
import type { BulletinPayload, CertificatePayload } from '../shared/fixtures.ts';
import { certificateParagraphs } from '../shared/fixtures.ts';
import bulletinTemplate from './bulletin.template.json' with { type: 'json' };
import certificateTemplate from './certificate.template.json' with { type: 'json' };

const plugins = { text, table, line, rectangle, qrcode: barcodes.qrcode };

let font: Font | undefined;
function getFont(): Font {
  if (!font) {
    const { regular, bold } = loadFonts();
    font = {
      NotoSans: { data: new Uint8Array(regular), fallback: true },
      NotoSansBold: { data: new Uint8Array(bold) },
    };
  }
  return font;
}

type Schema = {
  name: string;
  type: string;
  content?: string;
  readOnly?: boolean;
  textFormat?: string;
};

/** Same escape set as pdfme's own (not exported) `escapeInlineMarkdown`. */
const escapeMarkdown = (s: string): string => s.replace(/[\\*~`[\]()]/g, (c) => `\\${c}`);

/**
 * The template keeps `{{variables}}` in each field's `content`. pdfme only
 * parses inline markdown on read-only text, so the engine resolves every
 * variable itself and hands pdfme a fully static template. Data blocks
 * (`{{rows}}`, `{{@paragraphs}}`) are built here, the way the design's
 * engine would map its own blocks onto pdfme schemas.
 */
function resolveTemplate(
  template: Template,
  payload: unknown,
  blocks: Record<string, string>,
): Template {
  const schemas = (template.schemas as Schema[][]).map((page) =>
    page.map((schema) => {
      if (schema.content === undefined) return schema;
      const block = blocks[schema.content];
      const escape = schema.textFormat === 'inline-markdown' ? escapeMarkdown : undefined;
      const content = block ?? resolve(schema.content, payload, escape);
      return { ...schema, content, readOnly: true };
    }),
  );
  return { ...template, schemas } as Template;
}

function render(template: Template): Promise<Uint8Array> {
  return generate({ template, inputs: [{}], plugins, options: { font: getFont() } });
}

export function renderBulletin(payload: BulletinPayload): Promise<Uint8Array> {
  const rows = payload.rows.map((r) => [
    r.course,
    formatScore(r.score),
    String(r.max),
    String(r.coefficient),
    r.score === null ? '—' : String(r.score * r.coefficient),
  ]);
  return render(
    resolveTemplate(bulletinTemplate as unknown as Template, payload, {
      '{{rows}}': JSON.stringify(rows),
    }),
  );
}

export function renderCertificate(payload: CertificatePayload): Promise<Uint8Array> {
  // Paragraph text carries its own **bold** markup, so only the values are escaped.
  const body = certificateParagraphs.map((p) => resolve(p, payload, escapeMarkdown)).join('\n\n');
  return render(
    resolveTemplate(certificateTemplate as unknown as Template, payload, {
      '{{@paragraphs}}': body,
    }),
  );
}
