import { createContext, useContext } from 'react';
import {
  mergeAttributes,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from '@tiptap/react';
import type { TemplateField } from '../model/layout';

/** The fields of the template being edited, so each yellow zone shows its label. */
export const FieldsContext = createContext<ReadonlyMap<string, TemplateField>>(new Map());

function FieldChip({ node, selected }: NodeViewProps) {
  const fields = useContext(FieldsContext);
  const key = String(node.attrs.key);
  const field = fields.get(key);
  return (
    <NodeViewWrapper
      as="span"
      data-field-key={key}
      className={[
        'mx-0.5 inline-block rounded px-1.5 py-px align-baseline font-sans text-[0.9em] leading-snug',
        field ? 'bg-amber-100 text-amber-950' : 'bg-red-100 text-red-800',
        field?.required === false ? 'border border-dashed border-amber-400' : '',
        selected ? 'ring-2 ring-primary' : '',
      ].join(' ')}
    >
      {field?.label ?? key}
    </NodeViewWrapper>
  );
}

/** An inline zone filled when a document is issued; stored as { type: 'field', attrs: { key } }. */
export const FieldNode = Node.create({
  name: 'field',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return { key: { default: null } };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-field-key]',
        getAttrs: (element) => ({ key: (element as HTMLElement).dataset.fieldKey }),
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, { 'data-field-key': node.attrs.key }),
      node.attrs.key,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FieldChip);
  },
});
