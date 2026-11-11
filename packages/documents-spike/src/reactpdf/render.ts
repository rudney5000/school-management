import { createRequire } from 'node:module';
import type * as ReactPdf from '@react-pdf/renderer';
import { BulletinDocument, CertificateDocument } from '@school-hub/pdf-templates';
import { certificateParagraphs } from '../shared/fixtures.ts';
import type { BulletinPayload, CertificatePayload } from '../shared/fixtures.ts';
import { formatScore, resolve } from '../shared/variables.ts';

/**
 * Baseline only: the current production components from @school-hub/pdf-templates,
 * fed with the same data. Their layout is simpler than the two candidates
 * (no header lines, no info grid, no inline bold), so treat its numbers as an
 * order of magnitude, not a like-for-like result.
 */
// pdf-templates is compiled to CommonJS and registers its fonts on the CJS
// instance of @react-pdf/renderer; an ESM import would get a second instance
// without those fonts.
const { renderToBuffer } = createRequire(import.meta.url)('@react-pdf/renderer') as typeof ReactPdf;

const signature = (p: BulletinPayload | CertificatePayload) => ({
  locale: 'fr' as const,
  signerName: p.signature.signerName,
  signerRole: p.signature.signerRole,
  signedAt: p.document.issuedAt,
  verificationQrDataUrl: null,
  isStale: false,
});

export async function renderBulletin(payload: BulletinPayload): Promise<Uint8Array> {
  const element = BulletinDocument({
    locale: 'fr',
    schoolName: payload.school.name,
    studentFullName: payload.student.fullName,
    className: payload.class.name,
    academicPeriodLabel: `${payload.period.name} ${payload.period.schoolYear}`,
    rows: payload.rows.map((r) => ({
      course: r.course,
      score: formatScore(r.score),
      maxScore: String(r.max),
      coefficient: String(r.coefficient),
    })),
    signature: signature(payload),
  });
  return new Uint8Array(await renderToBuffer(element));
}

export async function renderCertificate(payload: CertificatePayload): Promise<Uint8Array> {
  const content = certificateParagraphs
    .map((p) => resolve(p, payload).replace(/\*\*/g, ''))
    .join('\n\n');
  const element = CertificateDocument({
    locale: 'fr',
    schoolName: payload.school.name,
    studentFullName: payload.student.fullName,
    type: 'enrollment',
    content,
    issuedAt: payload.document.issuedAt,
    signature: signature(payload),
  });
  return new Uint8Array(await renderToBuffer(element));
}
