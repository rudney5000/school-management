import { Image, Text, View } from '@react-pdf/renderer';
import type { BlockOf } from '../engine/layout';
import { mm, type RenderContext } from './context';

export const FLEX_ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' } as const;

/** Pulls a block out to the page edges, for coloured bands. */
function bleed(ctx: RenderContext, top: boolean) {
  const { margins } = ctx.layout.page;
  return {
    marginLeft: -mm(margins.left),
    marginRight: -mm(margins.right),
    paddingLeft: mm(margins.left),
    paddingRight: mm(margins.right),
    ...(top ? { marginTop: -mm(margins.top), paddingTop: mm(Math.max(margins.top, 6)) } : {}),
  };
}

export function Header({ block, ctx }: { block: BlockOf<'header'>; ctx: RenderContext }) {
  const logoWidth = mm(20);
  const lines = (
    <View style={{ flex: 1 }}>
      {block.lines.map((line, i) => (
        <Text
          key={i}
          style={{
            textAlign: block.align,
            fontSize: line.size ?? ctx.layout.theme.fontSize,
            fontWeight: line.bold ? 'bold' : 'normal',
            color: ctx.colors[line.color ?? (block.band ? 'white' : 'text')],
            marginBottom: 1.5,
          }}
        >
          {ctx.t(line.text)}
        </Text>
      ))}
    </View>
  );
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: mm(4),
        ...(block.band
          ? { ...bleed(ctx, true), paddingBottom: mm(5), backgroundColor: ctx.colors.primary }
          : {}),
      }}
    >
      {block.logo && (
        <Image src={ctx.asset(block.logo)} style={{ width: logoWidth, marginRight: mm(4) }} />
      )}
      {lines}
      {/* Keeps centred text centred on the page when a logo sits on the left. */}
      {block.logo && block.align === 'center' && <View style={{ width: logoWidth + mm(4) }} />}
    </View>
  );
}

export function Title({ block, ctx }: { block: BlockOf<'title'>; ctx: RenderContext }) {
  return (
    <View style={{ marginVertical: mm(3) }}>
      <Text
        style={{
          fontSize: block.size,
          fontWeight: 'bold',
          color: ctx.colors[block.color],
          textAlign: block.align,
        }}
      >
        {ctx.t(block.text)}
      </Text>
      {block.subtitle && (
        <Text
          style={{ fontSize: 9, color: ctx.colors.muted, textAlign: block.align, marginTop: 2 }}
        >
          {ctx.t(block.subtitle)}
        </Text>
      )}
    </View>
  );
}

/**
 * `**bold**` is read in the template text before the variables are replaced,
 * so a value from the payload can never turn itself bold.
 */
function richSegments(paragraph: string, ctx: RenderContext) {
  return paragraph.split(/\*\*(.+?)\*\*/s).map((segment, i) =>
    i % 2 === 1 ? (
      <Text key={i} style={{ fontWeight: 'bold' }}>
        {ctx.t(segment)}
      </Text>
    ) : (
      ctx.t(segment)
    ),
  );
}

export function TextBlock({ block, ctx }: { block: BlockOf<'text'>; ctx: RenderContext }) {
  return (
    <View style={{ marginBottom: mm(2) }}>
      {block.text.split(/\n\s*\n/).map((paragraph, i) => (
        <Text
          key={i}
          style={{
            textAlign: block.align,
            fontSize: block.size ?? ctx.layout.theme.fontSize,
            lineHeight: 1.45,
            marginBottom: mm(2.5),
          }}
        >
          {richSegments(paragraph.trim(), ctx)}
        </Text>
      ))}
    </View>
  );
}

export function InfoGrid({ block, ctx }: { block: BlockOf<'infoGrid'>; ctx: RenderContext }) {
  const rows: Array<typeof block.items> = [];
  for (let i = 0; i < block.items.length; i += block.columns) {
    rows.push(block.items.slice(i, i + block.columns));
  }
  return (
    <View
      style={{
        marginBottom: mm(4),
        paddingVertical: block.band ? mm(3) : 0,
        ...(block.band ? { ...bleed(ctx, false), backgroundColor: ctx.colors.rowAlt } : {}),
      }}
    >
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', marginBottom: 3 }}>
          {Array.from({ length: block.columns }, (_, c) => {
            const item = row[c];
            return (
              <Text key={c} style={{ flex: 1, paddingRight: mm(2) }}>
                {item && (
                  <>
                    <Text style={{ fontWeight: 'bold' }}>{ctx.t(item.label)} : </Text>
                    {ctx.t(item.value)}
                  </>
                )}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function ImageBlock({ block, ctx }: { block: BlockOf<'image'>; ctx: RenderContext }) {
  return (
    <View style={{ alignItems: FLEX_ALIGN[block.align], marginBottom: mm(3) }}>
      <Image src={ctx.asset(block.asset)} style={{ width: mm(block.width) }} />
    </View>
  );
}

export function Spacer({ block }: { block: BlockOf<'spacer'> }) {
  return <View style={{ height: mm(block.height) }} />;
}

export function Watermark({
  text,
  opacity,
  ctx,
}: {
  text: string;
  opacity: number;
  ctx: RenderContext;
}) {
  return (
    <View
      fixed
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: ctx.colors.primary,
          opacity,
          transform: 'rotate(-35deg)',
        }}
      >
        {text}
      </Text>
    </View>
  );
}
