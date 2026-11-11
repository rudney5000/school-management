import { describe, expect, it } from 'vitest';
import { bulletin, createDocuments, renderDocument, type LayoutInput } from '../src';
import {
  MemoryAssetStore,
  MemoryFileStore,
  MemoryFolderStore,
  MemoryIssuedDocumentStore,
  MemoryTemplateStore,
} from '../src/testing';
import {
  director,
  fakeRenderer,
  gombeScope,
  layout,
  params,
  publishedGroupTemplate,
  setup,
  stranger,
  team,
} from './helpers';

const issue = (ctx: ReturnType<typeof setup>, extra: object = {}) =>
  ctx.issuing.issue({
    type: 'bulletin',
    scope: gombeScope,
    params: params(),
    actor: director,
    ...extra,
  });

describe('IssuingService.issue', () => {
  it('numbers, hashes, renders and stores the document', async () => {
    const ctx = setup({ renderer: renderDocument });
    const template = await publishedGroupTemplate(ctx);

    const doc = await issue(ctx);
    expect(doc).toMatchObject({
      number: 'SJG-BUL-2025-2026-000001',
      status: 'issued',
      subjectType: 'student',
      templateId: template.id,
      templateVersion: 1,
      payloadVersion: 1,
      pdfKey: `documents/${gombeScope.schoolId}/${gombeScope.subSchoolId}/bulletin/${doc.id}.pdf`,
      issuedBy: director.userId,
    });
    expect(doc.contentHash).toMatch(/^[0-9a-f]{64}$/);

    const { pdf } = await ctx.issuing.download(director, doc.id);
    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe('%PDF-');
    expect(Buffer.from(pdf).toString('latin1')).toContain(doc.number);

    expect((await issue(ctx)).number).toBe('SJG-BUL-2025-2026-000002');
  });

  it('prints the QR link of the document and the date in Kinshasa time', async () => {
    const { renderer, calls } = fakeRenderer();
    // 23:30 UTC is already the next day in Kinshasa (UTC+1).
    const ctx = setup({ renderer, now: () => new Date('2025-12-19T23:30:00Z') });
    await publishedGroupTemplate(ctx);
    const doc = await issue(ctx);
    expect(calls[0]!.document).toEqual({
      number: doc.number,
      issuedAt: '2025-12-20',
      verifyUrl: `https://app.example.org/verify/${doc.id}`,
    });
    expect(calls[0]!.draft).toBeUndefined();
  });

  it('never changes an issued document when the template is republished', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const template = await publishedGroupTemplate(ctx);
    const first = await issue(ctx);
    const before = await ctx.issuing.download(director, first.id);

    const redesigned: LayoutInput = { ...layout, theme: { ...layout.theme, primary: '#7a1f1f' } };
    await ctx.templates.saveDraft(team, template.id, redesigned);
    await ctx.templates.publish(team, template.id);

    const after = await ctx.issuing.download(director, first.id);
    expect(after.document.templateVersion).toBe(1);
    expect(after.pdf).toEqual(before.pdf);
    expect((await issue(ctx)).templateVersion).toBe(2);
  });

  it('refuses bad parameters and wrong collected data, without using a number', async () => {
    let broken = true;
    const ctx = setup({
      renderer: fakeRenderer().renderer,
      collector: {
        collect: async () => (broken ? { ...bulletin.sample, totals: null } : bulletin.sample),
      },
    });
    await publishedGroupTemplate(ctx);

    await expect(issue(ctx, { params: { studentId: 'nope' } })).rejects.toMatchObject({
      code: 'INVALID_PARAMS',
    });
    await expect(issue(ctx)).rejects.toMatchObject({
      code: 'INVALID_PAYLOAD',
      issues: [{ path: 'totals' }],
    });

    broken = false;
    expect((await issue(ctx)).number).toBe('SJG-BUL-2025-2026-000001');
  });

  it('rolls everything back when rendering fails: no document, no gap in the numbers', async () => {
    let fail = true;
    const ctx = setup({
      renderer: async () => {
        if (fail) throw new Error('renderer crashed');
        return new Uint8Array([37]);
      },
    });
    await publishedGroupTemplate(ctx);

    await expect(issue(ctx)).rejects.toThrow('renderer crashed');
    expect(ctx.issued.documents.size).toBe(0);

    fail = false;
    expect((await issue(ctx)).number).toBe('SJG-BUL-2025-2026-000001');
  });

  it('gives distinct numbers to documents issued at the same time', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await publishedGroupTemplate(ctx);
    const docs = await Promise.all(Array.from({ length: 5 }, () => issue(ctx)));
    expect(docs.map((d) => d.number).sort()).toEqual(
      [1, 2, 3, 4, 5].map((n) => `SJG-BUL-2025-2026-00000${n}`),
    );
  });

  it('refuses to issue without a published template', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await expect(issue(ctx)).rejects.toMatchObject({ code: 'NO_TEMPLATE' });
  });
});

describe('revoking and correcting', () => {
  it('revokes once, and the verification page says so', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await publishedGroupTemplate(ctx);
    const doc = await issue(ctx);

    expect(await ctx.issuing.verify(doc.id)).toEqual({
      id: doc.id,
      documentType: 'bulletin',
      number: 'SJG-BUL-2025-2026-000001',
      schoolName: 'Complexe Scolaire Saint-Joseph',
      holderName: 'M*** K*** M***',
      issuedAt: '2025-12-19',
      status: 'issued',
      revokedAt: null,
      replacedBy: null,
    });

    await expect(ctx.issuing.revoke(director, doc.id, '  ')).rejects.toMatchObject({
      code: 'INVALID_PARAMS',
    });
    await ctx.issuing.revoke(director, doc.id, 'Note de mathématiques erronée');
    await expect(ctx.issuing.revoke(director, doc.id, 'Encore')).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    expect(await ctx.issuing.verify(doc.id)).toMatchObject({
      status: 'revoked',
      revokedAt: '2025-12-19',
    });
    // The PDF stays stored for history.
    expect((await ctx.issuing.download(director, doc.id)).pdf.length).toBeGreaterThan(0);
  });

  it('corrects a document: the old one is revoked and points to its replacement', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await publishedGroupTemplate(ctx);
    const old = await issue(ctx);

    const fixed = await issue(ctx, { replaces: { id: old.id, reason: 'Rang corrigé' } });
    expect(fixed).toMatchObject({ replacesId: old.id, number: 'SJG-BUL-2025-2026-000002' });
    expect(await ctx.issuing.find(director, old.id)).toMatchObject({
      status: 'revoked',
      revokedReason: 'Rang corrigé',
    });
    expect((await ctx.issuing.verify(old.id)).replacedBy).toBe(fixed.number);

    await expect(
      issue(ctx, { replaces: { id: old.id, reason: 'Deuxième correction' } }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('hides the documents of other schools', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await publishedGroupTemplate(ctx);
    const doc = await issue(ctx);

    await expect(ctx.issuing.download(stranger, doc.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(ctx.issuing.revoke(stranger, doc.id, 'x')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(
      ctx.issuing.issue({ type: 'bulletin', scope: gombeScope, params: params(), actor: stranger }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(await ctx.issuing.list(stranger, gombeScope.schoolId, {})).toEqual([]);
    expect((await ctx.issuing.list(team, gombeScope.schoolId, {})).length).toBe(1);
  });

  it('answers NOT_FOUND for an unknown document', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await expect(ctx.issuing.verify('6f1d0000-0000-4000-8000-000000000000')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });
});

describe('createDocuments', () => {
  it('requires an absolute verification URL', () => {
    const stores = {
      templates: new MemoryTemplateStore(),
      folders: new MemoryFolderStore(),
      issued: new MemoryIssuedDocumentStore(),
      files: new MemoryFileStore(),
      assets: new MemoryAssetStore(),
      collectors: {},
    };
    expect(() => createDocuments({ ...stores, verifyBaseUrl: '' })).toThrow(/absolute URL/);
    expect(() => createDocuments({ ...stores, verifyBaseUrl: 'javascript:alert(1)' })).toThrow(
      /http/,
    );
  });
});
