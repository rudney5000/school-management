import { Document, Page, renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { Header, ImageBlock, InfoGrid, Spacer, TextBlock, Title, Watermark } from '../blocks/basic';
import { createContext, mm, type AssetFile, type RenderContext } from '../blocks/context';
import { GradesTable } from '../blocks/GradesTable';
import { QrVerify } from '../blocks/QrVerify';
import { RichText } from '../blocks/RichText';
import { Signatures } from '../blocks/Signatures';
import type { DocumentMeta, DocumentTypeDefinition } from '../document-types/define';
import { DocumentError } from '../errors';
import { registerFonts } from './fonts';
import type { Block, Layout } from './layout';
import { validateLayout } from './validate';

export interface RenderInput {
  type: DocumentTypeDefinition;
  /** The layout as stored in a template version. */
  layout: unknown;
  payload: unknown;
  document: DocumentMeta;
  /** Images the layout points to, by asset id. */
  assets?: ReadonlyMap<string, AssetFile>;
  /** Previews carry a "BROUILLON" watermark so they are never taken for a real document. */
  draft?: boolean;
}

/** The rendering port: the issuing service only knows this signature. */
export type PdfRenderer = (input: RenderInput) => Promise<Uint8Array>;

function BlockView({ block, ctx }: { block: Block; ctx: RenderContext }) {
  switch (block.type) {
    case 'header':
      return <Header block={block} ctx={ctx} />;
    case 'title':
      return <Title block={block} ctx={ctx} />;
    case 'text':
      return <TextBlock block={block} ctx={ctx} />;
    case 'richText':
      return <RichText block={block} ctx={ctx} />;
    case 'infoGrid':
      return <InfoGrid block={block} ctx={ctx} />;
    case 'image':
      return <ImageBlock block={block} ctx={ctx} />;
    case 'spacer':
      return <Spacer block={block} />;
    case 'gradesTable':
      return <GradesTable block={block} ctx={ctx} />;
    case 'signatures':
      return <Signatures block={block} ctx={ctx} />;
    case 'qrVerify':
      return <QrVerify block={block} ctx={ctx} />;
    case 'watermark':
      return <Watermark text={ctx.t(block.text)} opacity={block.opacity} ctx={ctx} />;
  }
}

function DocumentView({
  ctx,
  title,
  draft,
}: {
  ctx: RenderContext;
  title: string;
  draft: boolean;
}) {
  const { page, theme, blocks } = ctx.layout;
  return (
    <Document title={title} creator="EcoLinga" producer="EcoLinga">
      <Page
        size={page.size}
        orientation={page.orientation}
        style={{
          paddingTop: mm(page.margins.top),
          paddingRight: mm(page.margins.right),
          paddingBottom: mm(page.margins.bottom),
          paddingLeft: mm(page.margins.left),
          fontFamily: theme.font,
          fontSize: theme.fontSize,
          color: ctx.colors.text,
        }}
      >
        {blocks.map((block, i) => (
          <BlockView key={i} block={block} ctx={ctx} />
        ))}
        {draft && <Watermark text="BROUILLON" opacity={0.12} ctx={ctx} />}
      </Page>
    </Document>
  );
}

function checkedLayout(input: RenderInput): Layout {
  const result = validateLayout(input.layout, input.type);
  if (!result.ok) {
    const [first] = result.issues;
    throw new DocumentError(
      first!.code,
      `Invalid ${input.type.key} template: ${first!.message}`,
      result.issues,
    );
  }
  return result.layout;
}

/**
 * Template + payload → PDF bytes. The payload is checked against the type's
 * schema first, so a collector bug fails here instead of printing a wrong
 * document.
 */
export const renderDocument: PdfRenderer = async (input) => {
  const layout = checkedLayout(input);
  const payload = input.type.payload.safeParse(input.payload);
  if (!payload.success) {
    throw new DocumentError(
      'INVALID_PAYLOAD',
      `Invalid ${input.type.key} payload`,
      payload.error.issues.map((issue) => ({
        code: 'INVALID_PAYLOAD' as const,
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  const needsQr = layout.blocks.some((block) => block.type === 'qrVerify');
  const qrDataUrl = needsQr
    ? await QRCode.toDataURL(input.document.verifyUrl, {
        margin: 0,
        errorCorrectionLevel: 'M',
        width: 400,
      })
    : '';

  const ctx = createContext({
    layout,
    variables: { ...(payload.data as Record<string, unknown>), document: input.document },
    assets: input.assets ?? new Map(),
    qrDataUrl,
    draft: input.draft ?? false,
  });

  registerFonts();
  const buffer = await renderToBuffer(
    <DocumentView ctx={ctx} title={input.document.number} draft={input.draft ?? false} />,
  );
  return new Uint8Array(buffer);
};
