import { describe, expect, it } from 'vitest';
import {
  bulletin,
  bulletinOfficielRdc,
  DocumentError,
  renderDocument,
  type LayoutInput,
} from '../src';

const document = {
  number: 'SJG-BUL-2025-2026-000045',
  issuedAt: '2025-12-19',
  verifyUrl: 'https://app.example.org/verify/0b6a1c1e-0000-4000-8000-000000000000',
};

/** React-PDF writes page objects uncompressed, so they can be counted in the bytes. */
const pageCount = (pdf: Uint8Array) =>
  (
    Buffer.from(pdf)
      .toString('latin1')
      .match(/\/Type \/Page\b/g) ?? []
  ).length;

// A 1x1 transparent PNG.
const PNG = Uint8Array.from(
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  ),
);

describe('renderDocument', () => {
  it('renders the starter bulletin on one A4 page', async () => {
    const pdf = await renderDocument({
      type: bulletin,
      layout: bulletinOfficielRdc.layout,
      payload: bulletin.sample,
      document,
    });
    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe('%PDF-');
    expect(pageCount(pdf)).toBe(1);
    expect(Buffer.from(pdf).toString('latin1')).toContain(document.number);
  });

  it('refuses a payload that does not match the type', async () => {
    const payload = { ...bulletin.sample, totals: { obtained: 216, max: 290 } };
    await expect(
      renderDocument({ type: bulletin, layout: bulletinOfficielRdc.layout, payload, document }),
    ).rejects.toMatchObject({ code: 'INVALID_PAYLOAD', issues: [{ path: 'totals.percent' }] });
  });

  it('refuses an invalid template', async () => {
    const layout = { ...bulletinOfficielRdc.layout, blocks: [{ type: 'chart' }] };
    await expect(
      renderDocument({ type: bulletin, layout, payload: bulletin.sample, document }),
    ).rejects.toBeInstanceOf(DocumentError);
  });

  it('draws images from the assets it is given, and fails on a missing one', async () => {
    const id = '8f2c0d6e-1111-4222-8333-944455556666';
    const layout: LayoutInput = {
      ...bulletinOfficielRdc.layout,
      blocks: [
        { type: 'image', asset: `asset:${id}`, width: 20 },
        ...bulletinOfficielRdc.layout.blocks,
      ],
    };
    const assets = new Map([[id, { data: PNG, mime: 'image/png' }]]);
    const pdf = await renderDocument({
      type: bulletin,
      layout,
      payload: bulletin.sample,
      document,
      assets,
    });
    expect(pageCount(pdf)).toBe(1);
    await expect(
      renderDocument({ type: bulletin, layout, payload: bulletin.sample, document }),
    ).rejects.toMatchObject({
      code: 'UNKNOWN_ASSET',
    });
  });

  it('marks previews as drafts', async () => {
    const pdf = await renderDocument({
      type: bulletin,
      layout: bulletinOfficielRdc.layout,
      payload: bulletin.sample,
      document,
      draft: true,
    });
    expect(pageCount(pdf)).toBe(1);
  });
});
