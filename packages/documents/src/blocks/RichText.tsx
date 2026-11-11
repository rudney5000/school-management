import { Text, View } from '@react-pdf/renderer';
import type { BlockOf, InlineNode, RichTextNode } from '../engine/layout';
import { FORMATTERS } from '../engine/variables';
import { mm, type RenderContext } from './context';

const HEADING_SIZE = { 1: 1.6, 2: 1.3, 3: 1.1 } as const;
/** Same yellow as the fields in the back-office, so a preview reads like the editor. */
const FIELD_BACKGROUND = '#fdf3c4';

type Marks = InlineNode['marks'];

function markStyle(marks: Marks) {
  const has = (type: string) => marks?.some((mark) => mark.type === type) ?? false;
  return {
    ...(has('bold') ? { fontWeight: 'bold' as const } : {}),
    ...(has('italic') ? { fontStyle: 'italic' as const } : {}),
    ...(has('underline') ? { textDecoration: 'underline' as const } : {}),
  };
}

/**
 * The value of a field, formatted for its type. A field without a value (a
 * preview, or an optional field left empty) shows its label in a yellow
 * zone on drafts, and nothing on issued documents.
 */
function FieldView({
  fieldKey,
  marks,
  ctx,
}: {
  fieldKey: string;
  marks: Marks;
  ctx: RenderContext;
}) {
  const field = ctx.layout.fields.find((f) => f.key === fieldKey);
  const raw = ctx.value(`fields.${fieldKey}`);
  const empty = raw === undefined || raw === null || raw === '';
  if (empty) {
    if (!ctx.draft) return null;
    return (
      <Text style={{ ...markStyle(marks), backgroundColor: FIELD_BACKGROUND }}>
        {` ${field?.label ?? fieldKey} `}
      </Text>
    );
  }
  const value =
    field?.type === 'date'
      ? FORMATTERS.date!(raw, undefined)
      : field?.type === 'number'
        ? FORMATTERS.number!(raw, undefined)
        : raw;
  return <Text style={markStyle(marks)}>{String(value)}</Text>;
}

/**
 * A value of the payload: dates print as dd/mm/yyyy, numbers with grouped
 * thousands, a missing value as a dash.
 */
function variableText(path: string, ctx: RenderContext): string {
  const raw = ctx.value(path);
  if (raw === null || raw === undefined || raw === '') return '—';
  if (typeof raw === 'number') return String(FORMATTERS.number!(raw, undefined));
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return String(FORMATTERS.date!(raw, undefined));
  }
  return String(raw);
}

function Inline({ node, ctx }: { node: InlineNode; ctx: RenderContext }) {
  switch (node.type) {
    case 'text':
      return <Text style={markStyle(node.marks)}>{node.text}</Text>;
    case 'field':
      return <FieldView fieldKey={node.attrs.key} marks={node.marks} ctx={ctx} />;
    case 'variable':
      return <Text style={markStyle(node.marks)}>{variableText(node.attrs.path, ctx)}</Text>;
    case 'hardBreak':
      return <Text>{'\n'}</Text>;
  }
}

function Paragraph({ node, ctx }: { node: RichTextNode; ctx: RenderContext }) {
  const base = ctx.layout.theme.fontSize;
  const heading = node.type === 'heading' ? node.attrs.level : null;
  const content = node.content ?? [];
  return (
    <Text
      style={{
        textAlign: node.attrs?.textAlign ?? 'left',
        fontSize: heading ? base * HEADING_SIZE[heading] : base,
        fontWeight: heading ? 'bold' : 'normal',
        lineHeight: heading ? 1.3 : 1.7,
        marginBottom: heading ? mm(4) : mm(2.5),
        marginTop: heading ? mm(2) : 0,
      }}
    >
      {/* An empty paragraph keeps its line, like an empty line in a word processor. */}
      {content.length === 0
        ? ' '
        : content.map((inline, i) => <Inline key={i} node={inline} ctx={ctx} />)}
    </Text>
  );
}

export function RichText({ block, ctx }: { block: BlockOf<'richText'>; ctx: RenderContext }) {
  return (
    <View style={{ marginBottom: mm(2) }}>
      {block.content.map((node, i) => (
        <Paragraph key={i} node={node} ctx={ctx} />
      ))}
    </View>
  );
}
