import { Image, Text, View } from '@react-pdf/renderer';
import type { BlockOf } from '../engine/layout';
import { mm, type RenderContext } from './context';

/** Signature slots side by side; a single slot sits on the right, as on paper. */
export function Signatures({ block, ctx }: { block: BlockOf<'signatures'>; ctx: RenderContext }) {
  const single = block.slots.length === 1;
  return (
    <View wrap={false} style={{ marginTop: mm(4), marginBottom: mm(4) }}>
      {block.place && (
        <Text style={{ textAlign: single ? 'right' : 'left', marginBottom: mm(2) }}>
          {ctx.t(block.place)}
        </Text>
      )}
      <View style={{ flexDirection: 'row', justifyContent: single ? 'flex-end' : 'space-between' }}>
        {block.slots.map((slot, i) => (
          <View
            key={i}
            style={{ width: single ? '42%' : `${90 / block.slots.length}%`, alignItems: 'center' }}
          >
            <Text style={{ color: ctx.colors.muted, fontSize: 9 }}>{ctx.t(slot.role)}</Text>
            <View
              style={{
                height: mm(20),
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {slot.signature && (
                <Image
                  src={ctx.asset(slot.signature)}
                  style={{ maxHeight: mm(18), maxWidth: '80%' }}
                />
              )}
              {slot.stamp && (
                <Image
                  src={ctx.asset(slot.stamp)}
                  style={{ position: 'absolute', height: mm(20), opacity: 0.85, right: 0 }}
                />
              )}
            </View>
            <View
              style={{
                width: '100%',
                borderTop: `0.75pt solid ${ctx.colors.text}`,
                marginBottom: 3,
              }}
            />
            {slot.name && <Text style={{ fontWeight: 'bold' }}>{ctx.t(slot.name)}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}
