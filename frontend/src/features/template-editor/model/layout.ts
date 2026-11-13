import type { JSONContent } from '@tiptap/react';

/** A field of a template, as the engine stores it (packages/documents, fieldSchema). */
export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'longText' | 'date' | 'number';
  required: boolean;
  /** v1 only knows manual entry; module data will come as other sources. */
  source: 'manual';
}

/** Any block of the layout; its shape is checked by the engine (packages/documents, blockSchemas). */
export type LayoutBlock = { type: string; [key: string]: unknown };

export type PageSize = 'A4' | 'A5';
export type Orientation = 'portrait' | 'landscape';
export type Font = 'NotoSans' | 'NotoSerif';

export interface PageSettings {
  size?: PageSize;
  orientation?: Orientation;
  margins?: { top: number; right: number; bottom: number; left: number };
  [key: string]: unknown;
}

export interface TemplateLayout {
  format: 1;
  page: PageSettings;
  theme: {
    font?: Font;
    fontSize?: number;
    primary?: string;
    accent?: string;
    [key: string]: unknown;
  };
  fields?: TemplateField[];
  blocks: LayoutBlock[];
}

/** The engine's defaults, so the page on screen has the size and margins of the PDF. */
export const DEFAULT_MARGINS = { top: 12, right: 12, bottom: 14, left: 12 };
export const DEFAULT_THEME = {
  primary: '#1e3a5f',
  accent: '#c9a227',
  font: 'NotoSans' as Font,
  fontSize: 10,
};

/** Width and height of the page, in millimetres. */
export function pageSize(page: PageSettings): { width: number; height: number } {
  const [short, long] = page.size === 'A5' ? [148, 210] : [210, 297];
  return page.orientation === 'landscape'
    ? { width: long, height: short }
    : { width: short, height: long };
}

/** The engine's defaults: a field without type is short text, without `required` it is required. */
export function normalizeField(
  field: Partial<TemplateField> & { key: string; label: string },
): TemplateField {
  return {
    key: field.key,
    label: field.label,
    type: field.type ?? 'text',
    required: field.required ?? true,
    source: 'manual',
  };
}

export const FIELD_TYPES: TemplateField['type'][] = ['text', 'longText', 'date', 'number'];

/** Name of the editor node that carries a non-text block (header, grades table…). */
export const LAYOUT_BLOCK = 'layoutBlock';

/**
 * The layout as one editor document: the rich text blocks become paragraphs,
 * every other block becomes a block node that keeps its settings. A trailing
 * empty line lets the user type after a final block.
 */
export function toEditorDoc(layout: TemplateLayout): JSONContent {
  const content: JSONContent[] = layout.blocks.flatMap((block) =>
    block.type === 'richText'
      ? ((block.content as JSONContent[] | undefined) ?? [])
      : [{ type: LAYOUT_BLOCK, attrs: { block } }],
  );
  if (!content.length || content[content.length - 1]!.type === LAYOUT_BLOCK) {
    content.push({ type: 'paragraph' });
  }
  return { type: 'doc', content };
}

const ALIGNS = new Set(['left', 'center', 'right', 'justify']);
const MARKS = new Set(['bold', 'italic', 'underline']);

/** Keeps only what the engine prints: the editor may carry extra attributes. */
function cleanInline(node: JSONContent): JSONContent | null {
  const marks = node.marks
    ?.filter((mark) => MARKS.has(mark.type))
    .map((mark) => ({ type: mark.type }));
  const withMarks = marks?.length ? { marks } : {};
  if (node.type === 'text')
    return node.text ? { type: 'text', text: node.text, ...withMarks } : null;
  if (node.type === 'field')
    return { type: 'field', attrs: { key: String(node.attrs?.key) }, ...withMarks };
  if (node.type === 'variable')
    return { type: 'variable', attrs: { path: String(node.attrs?.path) }, ...withMarks };
  if (node.type === 'hardBreak') return { type: 'hardBreak' };
  return null;
}

function cleanText(node: JSONContent): JSONContent | null {
  const align = node.attrs?.textAlign;
  const textAlign =
    typeof align === 'string' && ALIGNS.has(align) && align !== 'left' ? align : null;
  const content = (node.content ?? []).map(cleanInline).filter((n): n is JSONContent => !!n);
  const withContent = content.length ? { content } : {};
  if (node.type === 'heading') {
    const level = [1, 2, 3].includes(node.attrs?.level) ? node.attrs!.level : 1;
    return { type: 'heading', attrs: { level, textAlign }, ...withContent };
  }
  if (node.type === 'paragraph') {
    return { type: 'paragraph', ...(textAlign ? { attrs: { textAlign } } : {}), ...withContent };
  }
  return null;
}

/** Field keys the text still uses: a field whose zone was deleted from the text is dropped. */
export function usedFieldKeys(doc: JSONContent): Set<string> {
  const keys = new Set<string>();
  const walk = (node: JSONContent) => {
    if (node.type === 'field' && node.attrs?.key) keys.add(String(node.attrs.key));
    node.content?.forEach(walk);
  };
  walk(doc);
  return keys;
}

/**
 * The blocks of the editor document, top to bottom: each run of paragraphs
 * becomes one rich text block. A run made only of empty lines between blocks
 * is the gap the editor needs to type there, it is not saved.
 */
export function blocksOf(doc: JSONContent): LayoutBlock[] {
  const blocks: LayoutBlock[] = [];
  let run: JSONContent[] = [];
  const flush = () => {
    if (run.some((node) => node.content?.length)) blocks.push({ type: 'richText', content: run });
    run = [];
  };
  for (const node of doc.content ?? []) {
    if (node.type === LAYOUT_BLOCK) {
      flush();
      if (node.attrs?.block) blocks.push(node.attrs.block as LayoutBlock);
      continue;
    }
    const text = cleanText(node);
    if (text) run.push(text);
  }
  flush();
  // An empty page still needs one block: an empty text.
  return blocks.length ? blocks : [{ type: 'richText', content: [{ type: 'paragraph' }] }];
}

/** The layout to save: the page and theme set in the toolbar, the blocks of the page, the fields used. */
export function fromEditorDoc(
  base: TemplateLayout,
  doc: JSONContent,
  fields: TemplateField[],
  settings: { font: Font; size: PageSize; orientation: Orientation },
): TemplateLayout {
  const used = usedFieldKeys(doc);
  const kept = fields.filter((field) => used.has(field.key));
  const layout: TemplateLayout = {
    ...base,
    page: { ...base.page, size: settings.size, orientation: settings.orientation },
    theme: { ...base.theme, font: settings.font },
    fields: kept,
    blocks: blocksOf(doc),
  };
  // A bulletin has no typed fields: the key is left out rather than saved empty.
  if (!kept.length && !base.fields) delete layout.fields;
  return layout;
}

/** "Date de naissance" → "dateDeNaissance", unique among the existing keys. */
export function fieldKeyFor(label: string, taken: ReadonlySet<string>): string {
  const words = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  let base = words
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word[0]!.toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
    .slice(0, 32);
  if (!/^[a-z]/.test(base)) base = `champ${base}`;
  let key = base;
  for (let n = 2; taken.has(key); n++) key = `${base}${n}`;
  return key;
}
