import { describe, expect, it } from 'vitest';
import { bulletin, renderDocument, type LayoutInput } from '../src';
import {
  director,
  fakeRenderer,
  GOMBE,
  layout,
  LIMETE,
  OTHER_SCHOOL,
  publishedGroupTemplate,
  SCHOOL,
  setup,
  stranger,
  team,
} from './helpers';

const withTitle = (title: string): LayoutInput => ({
  ...layout,
  blocks: [{ type: 'title', text: title }, ...layout.blocks],
});

describe('TemplateService', () => {
  it('validates the layout when a template is created', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await expect(
      ctx.templates.create(team, {
        scope: { schoolId: SCHOOL, subSchoolId: null },
        documentType: 'bulletin',
        name: 'Cassé',
        layout: { ...layout, blocks: [{ type: 'title', text: '{{student.nom}}' }] },
      }),
    ).rejects.toMatchObject({
      issues: [
        { code: 'UNKNOWN_VARIABLE', path: 'blocks.0.text' },
        { code: 'REQUIRED_BLOCK_MISSING', path: 'blocks' },
      ],
    });
  });

  it('keeps a single live template per scope and type', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    await publishedGroupTemplate(ctx);
    await expect(
      ctx.templates.create(team, {
        scope: { schoolId: SCHOOL, subSchoolId: null },
        documentType: 'bulletin',
        name: 'Doublon',
        layout,
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('publishes immutable versions and rolls back without deleting any', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const template = await publishedGroupTemplate(ctx);

    await ctx.templates.saveDraft(team, template.id, withTitle('Nouveau design'));
    expect((await ctx.templates.find(team, template.id)).activeVersion).toBe(1);

    const v2 = await ctx.templates.publish(team, template.id, 'Titre ajouté');
    expect(v2.version).toBe(2);
    expect((await ctx.templates.find(team, template.id)).activeVersion).toBe(2);

    await ctx.templates.activate(team, template.id, 1);
    expect((await ctx.templates.find(team, template.id)).activeVersion).toBe(1);
    const versions = await ctx.templates.versions(team, template.id);
    expect(versions.map((v) => [v.version, v.note])).toEqual([
      [1, 'Première version'],
      [2, 'Titre ajouté'],
    ]);
    expect(versions[0]!.layout).toEqual(layout);
  });

  it('hides the templates of other schools', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const template = await publishedGroupTemplate(ctx);

    expect((await ctx.templates.find(director, template.id)).id).toBe(template.id);
    await expect(ctx.templates.find(stranger, template.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    await expect(ctx.templates.saveDraft(stranger, template.id, layout)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
    expect(await ctx.templates.list(stranger, SCHOOL)).toEqual([]);
  });

  it('refuses images that belong to another school', async () => {
    const ctx = setup({ renderer: fakeRenderer().renderer });
    const template = await publishedGroupTemplate(ctx);
    const png = { data: new Uint8Array([1]), mime: 'image/png' };
    const theirs = ctx.assets.add(OTHER_SCHOOL, png);
    const ours = ctx.assets.add(SCHOOL, png);

    await expect(
      ctx.templates.saveDraft(team, template.id, {
        ...layout,
        blocks: [{ type: 'image', asset: `asset:${theirs}` }, ...layout.blocks],
      }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_ASSET' });
    await ctx.templates.saveDraft(team, template.id, {
      ...layout,
      blocks: [{ type: 'image', asset: `asset:${ours}` }, ...layout.blocks],
    });
  });

  it('renders previews with the sample data, as drafts', async () => {
    const ctx = setup({ renderer: renderDocument });
    const template = await publishedGroupTemplate(ctx);
    const pdf = await ctx.templates.preview(director, template.id);
    expect(Buffer.from(pdf.subarray(0, 5)).toString()).toBe('%PDF-');

    const fake = fakeRenderer();
    const other = setup({ renderer: fake.renderer });
    const draft = await publishedGroupTemplate(other);
    await other.templates.preview(director, draft.id, { version: 1 });
    expect(fake.calls[0]).toMatchObject({
      draft: true,
      payload: bulletin.sample,
      document: { number: 'APERÇU' },
    });
  });

  it('previews a layout that is being edited, with the same checks as saving', async () => {
    const fake = fakeRenderer();
    const ctx = setup({ renderer: fake.renderer });
    const template = await publishedGroupTemplate(ctx);
    const edited = withTitle('Pas encore enregistré');

    await ctx.templates.preview(director, template.id, { layout: edited });
    expect(fake.calls[0]).toMatchObject({ layout: edited, draft: true });
    // Nothing was saved.
    expect((await ctx.templates.find(team, template.id)).draftLayout).toEqual(layout);

    await expect(
      ctx.templates.preview(director, template.id, {
        layout: { ...layout, blocks: [{ type: 'title', text: '{{student.nom}}' }] },
      }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_VARIABLE' });
  });

  describe('resolve', () => {
    it("prefers the sub-school's own template, then the group's", async () => {
      const ctx = setup({ renderer: fakeRenderer().renderer });
      const group = await publishedGroupTemplate(ctx);
      const limete = await ctx.templates.create(team, {
        scope: { schoolId: SCHOOL, subSchoolId: LIMETE },
        documentType: 'bulletin',
        name: 'Bulletin de Limete',
        layout: withTitle('Limete'),
      });

      // Not published yet: Limete still uses the group template.
      expect(
        (await ctx.templates.resolve({ schoolId: SCHOOL, subSchoolId: LIMETE }, 'bulletin'))
          .template.id,
      ).toBe(group.id);

      await ctx.templates.publish(team, limete.id);
      expect(
        (await ctx.templates.resolve({ schoolId: SCHOOL, subSchoolId: LIMETE }, 'bulletin'))
          .template.id,
      ).toBe(limete.id);
      expect(
        (await ctx.templates.resolve({ schoolId: SCHOOL, subSchoolId: GOMBE }, 'bulletin')).template
          .id,
      ).toBe(group.id);
    });

    it('answers NO_TEMPLATE rather than falling back to a default design', async () => {
      const ctx = setup({ renderer: fakeRenderer().renderer });
      await expect(
        ctx.templates.resolve({ schoolId: SCHOOL, subSchoolId: GOMBE }, 'bulletin'),
      ).rejects.toMatchObject({ code: 'NO_TEMPLATE' });

      const group = await publishedGroupTemplate(ctx);
      await ctx.templates.archive(team, group.id);
      await expect(
        ctx.templates.resolve({ schoolId: SCHOOL, subSchoolId: GOMBE }, 'bulletin'),
      ).rejects.toMatchObject({ code: 'NO_TEMPLATE' });
    });
  });
});
