import { GripVertical } from 'lucide-react';
import { Node, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { useTranslation } from '@shared/lib';
import { cn } from '@shared/lib/utils';
import { LAYOUT_BLOCK, type LayoutBlock } from '../model/layout';
import { BlockPreview } from './BlockPreview';

function LayoutBlockView({ node, selected, editor }: NodeViewProps) {
  const { t } = useTranslation();
  const block = node.attrs.block as LayoutBlock;
  return (
    <NodeViewWrapper
      data-layout-block=""
      className={cn(
        'group relative -mx-2 my-1 rounded px-2',
        editor.isEditable && 'hover:outline hover:outline-1 hover:outline-sky-300',
        selected && 'outline outline-2 outline-sky-500',
      )}
    >
      {editor.isEditable && (
        <div
          data-drag-handle=""
          contentEditable={false}
          className={cn(
            'absolute -left-7 top-0 hidden cursor-grab items-center gap-0.5 rounded bg-sky-500 px-0.5 py-0.5 text-white group-hover:flex',
            selected && 'flex',
          )}
          title={t('templateEditor.blocks.dragHint')}
        >
          <GripVertical className="size-3.5" />
        </div>
      )}
      {editor.isEditable && (
        <span
          contentEditable={false}
          className={cn(
            'absolute -top-2.5 right-1 z-10 hidden rounded bg-sky-500 px-1.5 font-sans text-[10px] font-medium leading-4 text-white group-hover:block',
            selected && 'block',
          )}
        >
          {t(`templateEditor.blocks.${block.type}.name`)}
        </span>
      )}
      <div contentEditable={false} className="select-none leading-normal">
        <BlockPreview block={block} />
      </div>
    </NodeViewWrapper>
  );
}

/**
 * A block of the layout that is not text (header, grades table, signatures…),
 * stored with its settings as `{ type: 'layoutBlock', attrs: { block } }`.
 * It is drawn with sample data and set through its dialog.
 */
export const LayoutBlockNode = Node.create({
  name: LAYOUT_BLOCK,
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      block: {
        default: null,
        // Kept in the document only: the editor never round-trips through HTML.
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-layout-block]' }];
  },

  renderHTML() {
    return ['div', { 'data-layout-block': '' }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LayoutBlockView);
  },
});
