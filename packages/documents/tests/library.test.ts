import { describe, expect, it } from 'vitest';
import { bulletinOfficielRdc } from '../src';
import { fakeRenderer, publishedGroupTemplate, setup, SCHOOL, stranger, team } from './helpers';

const library = async (ctx: ReturnType<typeof setup>) => {
  const { folders, templates } = await ctx.templates.library(team, SCHOOL);
  return {
    folders: folders.map((f) => [f.name, f.parentId, f.position]),
    templates: templates.map((t) => [t.name, t.folderId, t.position]),
  };
};

const draft = (ctx: ReturnType<typeof setup>, name: string, folderId: string | null = null) =>
  ctx.templates.create(team, {
    scope: { schoolId: SCHOOL, subSchoolId: null },
    documentType: 'free',
    name,
    folderId,
    layout: {
      format: 1,
      page: {},
      theme: {},
      blocks: [{ type: 'richText', content: [{ type: 'paragraph' }] }],
    },
  });

describe('template library', () => {
  it('files templates in folders, in order, and moves them', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const certificates = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: null,
      name: 'Certificats',
    });
    const attestations = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: null,
      name: 'Attestations',
    });
    const school = await draft(ctx, 'Certificat de scolarité', certificates.id);
    await draft(ctx, 'Certificat de fréquentation', certificates.id);
    const transfer = await draft(ctx, 'Certificat de transfert', certificates.id);

    await ctx.templates.moveTemplate(team, transfer.id, certificates.id, 0);
    await ctx.templates.moveFolder(team, attestations.id, null, 0);
    await ctx.templates.moveTemplate(team, school.id, attestations.id, 0);

    expect(await library(ctx)).toEqual({
      folders: [
        ['Attestations', null, 0],
        ['Certificats', null, 1],
      ],
      templates: expect.arrayContaining([
        ['Certificat de transfert', certificates.id, 0],
        ['Certificat de fréquentation', certificates.id, 1],
        ['Certificat de scolarité', attestations.id, 0],
      ]),
    });
  });

  it('nests folders but never inside themselves', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const parent = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: null,
      name: 'A',
    });
    const child = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: parent.id,
      name: 'B',
    });
    await expect(ctx.templates.moveFolder(team, parent.id, child.id, 0)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    await expect(ctx.templates.moveFolder(team, parent.id, parent.id, 0)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
  });

  it('deletes only empty folders', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const folder = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: null,
      name: 'Reçus',
    });
    const template = await draft(ctx, 'Reçu', folder.id);
    await expect(ctx.templates.deleteFolder(team, folder.id)).rejects.toMatchObject({
      code: 'CONFLICT',
    });
    await ctx.templates.moveTemplate(team, template.id, null, 0);
    await ctx.templates.deleteFolder(team, folder.id);
    expect((await library(ctx)).folders).toEqual([]);
  });

  it('renames and duplicates; deletes a draft, archives a published template', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const unpublished = await draft(ctx, 'Brouillon');
    await ctx.templates.renameTemplate(team, unpublished.id, 'Attestation de réussite');
    const copy = await ctx.templates.duplicate(
      team,
      unpublished.id,
      'Attestation de réussite (copie)',
    );
    expect(copy).toMatchObject({ activeVersion: null, draftLayout: unpublished.draftLayout });

    expect(await ctx.templates.remove(team, copy.id)).toBe('deleted');
    expect(await ctx.templates.find(team, unpublished.id)).toMatchObject({
      name: 'Attestation de réussite',
    });

    const published = await publishedGroupTemplate(ctx);
    expect(await ctx.templates.remove(team, published.id)).toBe('archived');
    expect((await library(ctx)).templates.map(([name]) => name)).toEqual([
      'Attestation de réussite',
    ]);
    expect((await ctx.templates.versions(team, published.id)).length).toBe(1);
  });

  it("hides another school's folders and refuses filing into them", async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const folder = await ctx.templates.createFolder(team, {
      schoolId: SCHOOL,
      parentId: null,
      name: 'X',
    });
    await expect(ctx.templates.renameFolder(stranger, folder.id, 'Y')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(await ctx.templates.library(stranger, SCHOOL)).toEqual({ folders: [], templates: [] });
    await expect(
      ctx.templates.create(team, {
        scope: { schoolId: 'school-sainte-marie', subSchoolId: null },
        documentType: 'bulletin',
        name: 'B',
        layout: bulletinOfficielRdc.layout,
        folderId: folder.id,
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});
