import { Node } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';

/**
 * Data blocks are atom nodes: TipTap only stores their settings, and the
 * engine expands them after `generateHTML` (see `expandBlocks` in to-html.ts).
 * This mirrors the design rule "what repeats is a dedicated block".
 */
export const BLOCK_NAMES = ['schoolHeader', 'gradesTable', 'signatures', 'qrVerify'] as const;
export type BlockName = (typeof BLOCK_NAMES)[number];

const blockNode = (name: BlockName) =>
  Node.create({
    name,
    group: 'block',
    atom: true,
    addAttributes() {
      return { config: { default: {} } };
    },
    renderHTML({ node }) {
      return ['div', { 'data-block': name, 'data-config': JSON.stringify(node.attrs.config) }];
    },
  });

export const extensions = [
  StarterKit,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table,
  TableRow,
  TableHeader,
  TableCell,
  ...BLOCK_NAMES.map(blockNode),
];
