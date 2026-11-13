import { useContext } from 'react';
import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import { useTranslation } from '@shared/lib';
import { variableLabelKey, variableText } from '../model/variables';
import { PreviewContext } from './BlockPreview';

function VariableChip({ node, selected }: NodeViewProps) {
  const { t } = useTranslation();
  const { sample } = useContext(PreviewContext);
  const path = String(node.attrs.path);
  return (
    <NodeViewWrapper
      as="span"
      data-variable-path={path}
      title={t(variableLabelKey(path), { defaultValue: path })}
      className={[
        'mx-px inline rounded bg-sky-100 px-1 text-sky-950 underline decoration-sky-400 decoration-dotted underline-offset-2',
        selected ? 'ring-2 ring-primary' : '',
      ].join(' ')}
    >
      {variableText(path, sample)}
    </NodeViewWrapper>
  );
}

/**
 * A value read from the modules when the document is issued (the student's
 * name, the period…), stored as `{ type: 'variable', attrs: { path } }`. The
 * editor shows it with the sample data, in blue so it is not taken for text.
 */
export const VariableNode = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return { path: { default: null } };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-variable-path]',
        getAttrs: (element) => ({ path: (element as HTMLElement).dataset.variablePath }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-variable-path': node.attrs.path }),
      node.attrs.path,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableChip);
  },
});
