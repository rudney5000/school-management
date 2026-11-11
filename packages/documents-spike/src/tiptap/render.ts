import type { JSONContent } from '@tiptap/core';
import { fontFiles, loadFonts } from '../shared/fonts.ts';
import { certificateParagraphs } from '../shared/fixtures.ts';
import type { BulletinPayload, CertificatePayload } from '../shared/fixtures.ts';
import { paragraphNode, toHtml } from './to-html.ts';
import bulletinDoc from './bulletin.doc.json' with { type: 'json' };
import certificateDoc from './certificate.doc.json' with { type: 'json' };

export const GOTENBERG_URL = process.env.GOTENBERG_URL ?? 'http://gotenberg:3000';

/** The certificate body is inserted just before the signature block. */
function certificateWithBody(): JSONContent {
  const content = [...(certificateDoc.content as JSONContent[])];
  const at = content.findIndex((n) => n.type === 'signatures');
  content.splice(at, 0, ...certificateParagraphs.map(paragraphNode));
  return { ...certificateDoc, content };
}

export function bulletinHtml(payload: BulletinPayload): Promise<string> {
  return toHtml(
    bulletinDoc as JSONContent,
    payload as unknown as Record<string, unknown>,
    'bulletin',
  );
}

export function certificateHtml(payload: CertificatePayload): Promise<string> {
  return toHtml(
    certificateWithBody(),
    payload as unknown as Record<string, unknown>,
    'certificate',
  );
}

/**
 * HTML -> PDF through Gotenberg's Chromium route. The fonts travel with the
 * request, next to index.html, so the PDF never depends on fonts installed
 * in the Gotenberg image.
 */
export async function htmlToPdf(html: string): Promise<Uint8Array> {
  const { regular, bold } = loadFonts();
  const form = new FormData();
  form.append('files', new Blob([html], { type: 'text/html' }), 'index.html');
  form.append('files', new Blob([new Uint8Array(regular)]), fontFiles.regular.name);
  form.append('files', new Blob([new Uint8Array(bold)]), fontFiles.bold.name);
  form.append('preferCssPageSize', 'true');
  form.append('printBackground', 'true');
  form.append('marginTop', '0');
  form.append('marginBottom', '0');
  form.append('marginLeft', '0');
  form.append('marginRight', '0');

  const res = await fetch(`${GOTENBERG_URL}/forms/chromium/convert/html`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Gotenberg ${res.status}: ${await res.text()}`);
  }
  return new Uint8Array(await res.arrayBuffer());
}

export async function renderBulletin(payload: BulletinPayload): Promise<Uint8Array> {
  return htmlToPdf(await bulletinHtml(payload));
}

export async function renderCertificate(payload: CertificatePayload): Promise<Uint8Array> {
  return htmlToPdf(await certificateHtml(payload));
}
