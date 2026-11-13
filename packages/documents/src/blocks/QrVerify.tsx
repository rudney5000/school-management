import { Image, Text, View } from '@react-pdf/renderer';
import type { BlockOf } from '../engine/layout';
import { mm, type RenderContext } from './context';

const DEFAULT_CAPTION =
  'Document n° {{document.number}}\nScannez le code QR pour vérifier son authenticité.';

/** The QR code points to the public verification page of the issued document. */
export function QrVerify({ block, ctx }: { block: BlockOf<'qrVerify'>; ctx: RenderContext }) {
  const { margins } = ctx.layout.page;
  const placement =
    block.position === 'inline'
      ? { marginBottom: mm(3) }
      : {
          position: 'absolute' as const,
          bottom: mm(margins.bottom),
          ...(block.position === 'bottom-left'
            ? { left: mm(margins.left) }
            : { right: mm(margins.right) }),
        };
  return (
    <View
      wrap={false}
      style={{
        flexDirection: block.position === 'bottom-right' ? 'row-reverse' : 'row',
        alignItems: 'center',
        ...placement,
      }}
    >
      <Image src={ctx.qrDataUrl} style={{ width: mm(block.size), height: mm(block.size) }} />
      <Text
        style={{
          fontSize: 7.5,
          color: ctx.colors.muted,
          marginHorizontal: mm(3),
          maxWidth: mm(70),
          textAlign: block.position === 'bottom-right' ? 'right' : 'left',
        }}
      >
        {ctx.t(block.caption ?? DEFAULT_CAPTION)}
      </Text>
    </View>
  );
}
