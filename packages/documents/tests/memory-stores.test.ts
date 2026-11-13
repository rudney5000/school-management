import { describe, expect, it } from 'vitest';
import { MemoryIssuedDocumentStore, MemoryTemplateStore } from '../src/testing';
import type { IssuedDocument } from '../src';

const issued = (number: string): IssuedDocument => ({
  id: crypto.randomUUID(),
  schoolId: 's1',
  subSchoolId: 'sub1',
  documentType: 'bulletin',
  number,
  subjectType: 'student',
  subjectId: 'st1',
  templateId: 't1',
  templateVersion: 1,
  payload: {},
  payloadVersion: 1,
  contentHash: 'h',
  pdfKey: 'k',
  status: 'issued',
  revokedAt: null,
  revokedReason: null,
  replacesId: null,
  policyId: null,
  policyVersion: null,
  issuedBy: 'u1',
  issuedAt: new Date(),
});

describe('MemoryTemplateStore', () => {
  it('keeps published versions immutable', async () => {
    const store = new MemoryTemplateStore();
    const scope = { schoolId: 's1', subSchoolId: null };
    const template = await store.insert({
      ...scope,
      documentType: 'bulletin',
      name: 'B',
      draftLayout: null,
      createdBy: 'u1',
      folderId: null,
      position: 0,
    });
    const version = {
      templateId: template.id,
      version: 1,
      layout: {} as never,
      layoutFormat: 1,
      note: null,
      publishedBy: 'u1',
      publishedAt: new Date(),
    };
    await store.appendVersion(version);
    await expect(store.appendVersion(version)).rejects.toMatchObject({ code: 'CONFLICT' });
    await store.setActive(template.id, 1);
    expect((await store.findForScope(scope, 'bulletin'))?.activeVersion).toBe(1);
    expect(await store.latestVersion(template.id)).toBe(1);
  });
});

describe('MemoryIssuedDocumentStore', () => {
  it('rolls back the number and the document when the transaction fails', async () => {
    const store = new MemoryIssuedDocumentStore();
    await expect(
      store.transaction(async (tx) => {
        await tx.nextNumber('sub1', 'bulletin', '2025-2026');
        await tx.insert(issued('A'));
        throw new Error('render failed');
      }),
    ).rejects.toThrow('render failed');
    expect(store.documents.size).toBe(0);

    const n = await store.transaction((tx) => tx.nextNumber('sub1', 'bulletin', '2025-2026'));
    expect(n).toBe(1);
  });

  it('runs concurrent transactions one after the other: no duplicate numbers', async () => {
    const store = new MemoryIssuedDocumentStore();
    const numbers = await Promise.all(
      Array.from({ length: 5 }, () =>
        store.transaction((tx) => tx.nextNumber('sub1', 'bulletin', '2025-2026')),
      ),
    );
    expect(numbers.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
