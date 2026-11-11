import { z } from 'zod';

/**
 * A template layout: the page, the theme and a list of blocks, top to bottom.
 * Every object is strict, so a misspelled property is rejected instead of
 * being silently ignored. Lengths are in millimetres, font sizes in points.
 */

export const LAYOUT_FORMAT = 1;

const assetRef = z
  .string()
  .regex(
    /^asset:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    'expected asset:<uuid>',
  );

const align = z.enum(['left', 'center', 'right']);
const color = z.enum(['text', 'primary', 'accent', 'muted', 'white']);
const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'expected #rrggbb');
const mm = (max: number) => z.number().min(0).max(max);

/**
 * A field of a template: a yellow zone filled when a document is issued.
 * `source` says where the value comes from; v1 only knows manual entry, the
 * module data (student, class…) will come as other sources.
 */
export const fieldSchema = z
  .object({
    key: z.string().regex(/^[a-z][a-zA-Z0-9_]{0,39}$/, 'expected a short identifier'),
    label: z.string().trim().min(1).max(80),
    type: z.enum(['text', 'longText', 'date', 'number']).default('text'),
    required: z.boolean().default(true),
    source: z.enum(['manual']).default('manual'),
  })
  .strict();

export type FieldDefinition = z.output<typeof fieldSchema>;

const textAlign = z.enum(['left', 'center', 'right', 'justify']).nullable().optional();
const mark = z.object({ type: z.enum(['bold', 'italic', 'underline']) }).strict();
const marks = z.array(mark).max(3).optional();

/** Inline content of the rich text, in the shape TipTap produces. */
const inlineNode = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: z.string().min(1), marks }).strict(),
  z
    .object({
      type: z.literal('field'),
      attrs: z.object({ key: z.string().min(1) }).strict(),
      marks,
    })
    .strict(),
  z
    .object({
      type: z.literal('variable'),
      /** A value of the payload, as in `{{student.fullName}}`. */
      attrs: z.object({ path: z.string().regex(/^[a-zA-Z][\w.]*$/) }).strict(),
      marks,
    })
    .strict(),
  z.object({ type: z.literal('hardBreak'), marks }).strict(),
]);

const richTextNode = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('paragraph'),
      attrs: z.object({ textAlign }).strict().optional(),
      content: z.array(inlineNode).optional(),
    })
    .strict(),
  z
    .object({
      type: z.literal('heading'),
      attrs: z
        .object({ level: z.union([z.literal(1), z.literal(2), z.literal(3)]), textAlign })
        .strict(),
      content: z.array(inlineNode).optional(),
    })
    .strict(),
]);

export type RichTextNode = z.output<typeof richTextNode>;
export type InlineNode = z.output<typeof inlineNode>;

const headerLine = z
  .object({
    text: z.string().min(1),
    size: z.number().min(5).max(40).optional(),
    bold: z.boolean().optional(),
    color: color.optional(),
  })
  .strict();

export const blockSchemas = {
  header: z
    .object({
      type: z.literal('header'),
      logo: assetRef.optional(),
      align: align.default('center'),
      /** Coloured band across the full page width, text in white. */
      band: z.boolean().default(false),
      lines: z.array(headerLine).min(1).max(8),
    })
    .strict(),
  title: z
    .object({
      type: z.literal('title'),
      text: z.string().min(1),
      subtitle: z.string().optional(),
      size: z.number().min(8).max(40).default(16),
      color: color.default('primary'),
      align: align.default('center'),
    })
    .strict(),
  text: z
    .object({
      type: z.literal('text'),
      /** Paragraphs are separated by a blank line; `**bold**` marks bold words. */
      text: z.string().min(1),
      align: z.enum(['left', 'center', 'right', 'justify']).default('left'),
      size: z.number().min(6).max(24).optional(),
    })
    .strict(),
  /** Free text written in the editor: paragraphs, headings, bold, italic, underline, fields and variables. */
  richText: z
    .object({
      type: z.literal('richText'),
      content: z.array(richTextNode).min(1).max(400),
    })
    .strict(),
  infoGrid: z
    .object({
      type: z.literal('infoGrid'),
      columns: z.number().int().min(1).max(4).default(2),
      /** Light grey background behind the grid. */
      band: z.boolean().default(false),
      items: z
        .array(z.object({ label: z.string().min(1), value: z.string() }).strict())
        .min(1)
        .max(16),
    })
    .strict(),
  image: z
    .object({
      type: z.literal('image'),
      asset: assetRef,
      width: mm(190).default(40),
      align: align.default('center'),
    })
    .strict(),
  spacer: z.object({ type: z.literal('spacer'), height: mm(150) }).strict(),
  gradesTable: z
    .object({
      type: z.literal('gradesTable'),
      columns: z
        .array(z.enum(['course', 'score', 'max', 'coefficient', 'points']))
        .min(1)
        .refine((cols) => new Set(cols).size === cols.length, 'duplicate column'),
      labels: z
        .object({
          course: z.string(),
          score: z.string(),
          max: z.string(),
          coefficient: z.string(),
          points: z.string(),
          total: z.string(),
          percent: z.string(),
          rank: z.string(),
        })
        .partial()
        .strict()
        .optional(),
      showTotals: z.boolean().default(true),
      showRank: z.boolean().default(true),
    })
    .strict(),
  signatures: z
    .object({
      type: z.literal('signatures'),
      /** Line printed above the slots, e.g. "Fait à {{school.city}}, le {{document.issuedAt|date}}". */
      place: z.string().optional(),
      slots: z
        .array(
          z
            .object({
              role: z.string().min(1),
              name: z.string().optional(),
              signature: assetRef.optional(),
              stamp: assetRef.optional(),
            })
            .strict(),
        )
        .min(1)
        .max(3),
    })
    .strict(),
  qrVerify: z
    .object({
      type: z.literal('qrVerify'),
      position: z.enum(['bottom-left', 'bottom-right', 'inline']).default('bottom-left'),
      size: mm(60).default(22),
      caption: z.string().optional(),
    })
    .strict(),
  watermark: z
    .object({
      type: z.literal('watermark'),
      text: z.string().min(1),
      opacity: z.number().min(0.02).max(0.5).default(0.08),
    })
    .strict(),
} as const;

export type BlockType = keyof typeof blockSchemas;
export const BLOCK_TYPES = Object.keys(blockSchemas) as BlockType[];

export const blockSchema = z.discriminatedUnion('type', [
  blockSchemas.header,
  blockSchemas.title,
  blockSchemas.text,
  blockSchemas.richText,
  blockSchemas.infoGrid,
  blockSchemas.image,
  blockSchemas.spacer,
  blockSchemas.gradesTable,
  blockSchemas.signatures,
  blockSchemas.qrVerify,
  blockSchemas.watermark,
]);

export const layoutSchema = z
  .object({
    format: z.literal(LAYOUT_FORMAT),
    page: z
      .object({
        size: z.enum(['A4', 'A5']).default('A4'),
        orientation: z.enum(['portrait', 'landscape']).default('portrait'),
        margins: z
          .object({ top: mm(50), right: mm(50), bottom: mm(50), left: mm(50) })
          .strict()
          .default({ top: 12, right: 12, bottom: 14, left: 12 }),
      })
      .strict(),
    theme: z
      .object({
        primary: hexColor.default('#1e3a5f'),
        accent: hexColor.default('#c9a227'),
        font: z.enum(['NotoSans', 'NotoSerif']).default('NotoSans'),
        fontSize: z.number().min(6).max(16).default(10),
      })
      .strict(),
    /** The fields the rich text refers to, filled at issue time. */
    fields: z.array(fieldSchema).max(50).default([]),
    blocks: z.array(blockSchema).min(1).max(60),
  })
  .strict();

/** A layout as stored (defaults may be missing). */
export type LayoutInput = z.input<typeof layoutSchema>;
/** A layout after validation, with every default filled in. */
export type Layout = z.output<typeof layoutSchema>;
export type Block = z.output<typeof blockSchema>;
export type BlockOf<T extends BlockType> = Extract<Block, { type: T }>;

/** Every text of a block that may contain `{{variables}}`, with its JSON path inside the block. */
export function blockTexts(block: Block): Array<{ path: string; text: string }> {
  switch (block.type) {
    case 'header':
      return block.lines.map((line, i) => ({ path: `lines.${i}.text`, text: line.text }));
    case 'title':
      return [
        { path: 'text', text: block.text },
        ...(block.subtitle ? [{ path: 'subtitle', text: block.subtitle }] : []),
      ];
    case 'text':
      return [{ path: 'text', text: block.text }];
    case 'infoGrid':
      return block.items.flatMap((item, i) => [
        { path: `items.${i}.label`, text: item.label },
        { path: `items.${i}.value`, text: item.value },
      ]);
    case 'signatures':
      return [
        ...(block.place ? [{ path: 'place', text: block.place }] : []),
        ...block.slots.flatMap((slot, i) => [
          { path: `slots.${i}.role`, text: slot.role },
          ...(slot.name ? [{ path: `slots.${i}.name`, text: slot.name }] : []),
        ]),
      ];
    case 'qrVerify':
      return block.caption ? [{ path: 'caption', text: block.caption }] : [];
    case 'watermark':
      return [{ path: 'text', text: block.text }];
    // Rich text is printed as written; only its variable nodes read the payload.
    case 'richText':
      return block.content.flatMap((node, i) =>
        (node.content ?? []).flatMap((inline, j) =>
          inline.type === 'variable'
            ? [{ path: `content.${i}.content.${j}`, text: `{{${inline.attrs.path}}}` }]
            : [],
        ),
      );
    case 'image':
    case 'spacer':
    case 'gradesTable':
      return [];
  }
}

/** Every field key a rich text block points to, with its JSON path inside the block. */
export function blockFieldRefs(block: Block): Array<{ path: string; key: string }> {
  if (block.type !== 'richText') return [];
  return block.content.flatMap((node, i) =>
    (node.content ?? []).flatMap((inline, j) =>
      inline.type === 'field' ? [{ path: `content.${i}.content.${j}`, key: inline.attrs.key }] : [],
    ),
  );
}

/** Every `asset:<uuid>` a block points to, with its JSON path inside the block. */
export function blockAssets(block: Block): Array<{ path: string; ref: string }> {
  switch (block.type) {
    case 'header':
      return block.logo ? [{ path: 'logo', ref: block.logo }] : [];
    case 'image':
      return [{ path: 'asset', ref: block.asset }];
    case 'signatures':
      return block.slots.flatMap((slot, i) => [
        ...(slot.signature ? [{ path: `slots.${i}.signature`, ref: slot.signature }] : []),
        ...(slot.stamp ? [{ path: `slots.${i}.stamp`, ref: slot.stamp }] : []),
      ]);
    default:
      return [];
  }
}

export const assetIdOf = (ref: string) => ref.slice('asset:'.length);
