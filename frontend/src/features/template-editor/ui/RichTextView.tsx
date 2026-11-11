import type { CSSProperties, ReactNode } from 'react';
import type { JSONContent } from '@tiptap/react';

const HEADING_SIZE: Record<number, string> = { 1: '1.6em', 2: '1.3em', 3: '1.1em' };

function markStyle(marks: JSONContent['marks']): CSSProperties {
  const has = (type: string) => marks?.some((mark) => mark.type === type) ?? false;
  return {
    fontWeight: has('bold') ? 700 : undefined,
    fontStyle: has('italic') ? 'italic' : undefined,
    textDecoration: has('underline') ? 'underline' : undefined,
  };
}

/**
 * Draws the rich text of a template, read only, like the PDF engine prints
 * it. Each field is drawn by `renderField`, so the issuing screen can make
 * it a zone to fill; each variable by `renderVariable`.
 */
export function RichTextView({
  content,
  renderField,
  renderVariable,
}: {
  content: JSONContent[];
  renderField: (key: string, style: CSSProperties) => ReactNode;
  /** A value read from the modules when the document is issued. */
  renderVariable: (path: string, style: CSSProperties) => ReactNode;
}) {
  return (
    <div className="template-page-text">
      {content.map((node, i) => {
        const align = (node.attrs?.textAlign as CSSProperties['textAlign']) ?? undefined;
        const inline = (node.content ?? []).map((child, j) => {
          const style = markStyle(child.marks);
          if (child.type === 'text') {
            return (
              <span key={j} style={style}>
                {child.text}
              </span>
            );
          }
          if (child.type === 'field') {
            return <span key={j}>{renderField(String(child.attrs?.key), style)}</span>;
          }
          if (child.type === 'variable') {
            return <span key={j}>{renderVariable(String(child.attrs?.path), style)}</span>;
          }
          return <br key={j} />;
        });
        if (node.type === 'heading') {
          const level = Number(node.attrs?.level ?? 1);
          return (
            <div
              key={i}
              role="heading"
              aria-level={level}
              style={{
                textAlign: align,
                fontSize: HEADING_SIZE[level],
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '2mm 0 4mm',
              }}
            >
              {inline}
            </div>
          );
        }
        return (
          <p key={i} style={{ textAlign: align }}>
            {inline.length ? inline : ' '}
          </p>
        );
      })}
    </div>
  );
}
