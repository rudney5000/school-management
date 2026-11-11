import { getDocumentType } from '../document-types';
import type { DocumentTypeKey } from '../document-types/define';
import { blockAssets, assetIdOf, LAYOUT_FORMAT, type LayoutInput } from '../engine/layout';
import type { PdfRenderer } from '../engine/render';
import { validateLayout } from '../engine/validate';
import { DocumentError } from '../errors';
import type {
  Actor,
  AssetStore,
  DocumentFolder,
  DocumentTemplate,
  FolderStore,
  Scope,
  TemplateStore,
  TemplateVersion,
} from '../ports';

/** Same answer for "does not exist" and "belongs to another school": nothing leaks. */
export function canAccess(actor: Actor, schoolId: string): boolean {
  return actor.schoolId === null || actor.schoolId === schoolId;
}

/** Loads the images a layout points to, from the school that owns the template. */
export async function loadLayoutAssets(assets: AssetStore, schoolId: string, layout: unknown) {
  const parsed = layout as { blocks?: unknown };
  if (!Array.isArray(parsed?.blocks)) return new Map();
  const ids = new Set<string>();
  for (const block of parsed.blocks) {
    try {
      for (const { ref } of blockAssets(block)) ids.add(assetIdOf(ref));
    } catch {
      // An unreadable block is reported by validation, not here.
    }
  }
  return ids.size ? assets.load(schoolId, [...ids]) : new Map();
}

/** What the template page shows: the school's folders and its live templates. */
export interface TemplateLibrary {
  folders: DocumentFolder[];
  templates: DocumentTemplate[];
}

/** Gives the siblings positions 0, 1, 2… with `moved` inserted at `index`. */
function reorder<T extends { id: string; position: number }>(
  siblings: T[],
  movedId: string,
  index: number,
): Array<{ id: string; position: number }> {
  const others = siblings
    .filter((item) => item.id !== movedId)
    .sort((a, b) => a.position - b.position);
  const at = Math.max(0, Math.min(index, others.length));
  const ordered = [
    ...others.slice(0, at).map((o) => o.id),
    movedId,
    ...others.slice(at).map((o) => o.id),
  ];
  return ordered.map((id, position) => ({ id, position }));
}

/** Positions 0, 1, 2… in the current order. */
const compact = <T extends { id: string; position: number }>(items: T[]) =>
  [...items].sort((a, b) => a.position - b.position).map(({ id }, position) => ({ id, position }));

export interface ResolvedTemplate {
  template: DocumentTemplate;
  version: TemplateVersion;
}

export interface TemplateServiceDeps {
  templates: TemplateStore;
  folders: FolderStore;
  assets: AssetStore;
  renderer: PdfRenderer;
  now: () => Date;
}

/**
 * Templates: a mutable draft, published as immutable numbered versions, one
 * of which is active. Publishing never touches issued documents: they point
 * to the exact version that produced them.
 */
export class TemplateService {
  constructor(private readonly deps: TemplateServiceDeps) {}

  private async get(actor: Actor, id: string): Promise<DocumentTemplate> {
    const template = await this.deps.templates.findById(id);
    if (!template || !canAccess(actor, template.schoolId)) {
      throw new DocumentError('NOT_FOUND', `Template ${id} not found`);
    }
    return template;
  }

  private async check(
    template: Pick<DocumentTemplate, 'schoolId' | 'documentType'>,
    layout: unknown,
  ) {
    const result = validateLayout(layout, getDocumentType(template.documentType), {
      assetIds: await this.deps.assets.listIds(template.schoolId),
    });
    if (!result.ok) {
      throw new DocumentError(
        result.issues[0]!.code,
        `The template has ${result.issues.length} problem(s)`,
        result.issues,
      );
    }
  }

  async list(actor: Actor, schoolId: string): Promise<DocumentTemplate[]> {
    if (!canAccess(actor, schoolId)) return [];
    return this.deps.templates.listForSchool(schoolId);
  }

  async find(actor: Actor, id: string): Promise<DocumentTemplate> {
    return this.get(actor, id);
  }

  async versions(actor: Actor, id: string): Promise<TemplateVersion[]> {
    await this.get(actor, id);
    return this.deps.templates.listVersions(id);
  }

  /** Creates the template of a group (subSchoolId null) or of one sub-school, with a first draft. */
  async create(
    actor: Actor,
    input: {
      scope: Scope;
      documentType: DocumentTypeKey;
      name: string;
      layout: LayoutInput;
      folderId?: string | null;
    },
  ): Promise<DocumentTemplate> {
    if (!canAccess(actor, input.scope.schoolId)) {
      throw new DocumentError('NOT_FOUND', 'School not found');
    }
    await this.check(
      { schoolId: input.scope.schoolId, documentType: input.documentType },
      input.layout,
    );
    const type = getDocumentType(input.documentType);
    if (
      type.oneTemplatePerScope &&
      (await this.deps.templates.findForScope(input.scope, input.documentType))
    ) {
      throw new DocumentError('CONFLICT', `A ${input.documentType} template already exists here`);
    }
    const folderId = input.folderId ?? null;
    if (folderId) await this.folder(actor, folderId, input.scope.schoolId);
    const siblings = (await this.deps.templates.listForSchool(input.scope.schoolId)).filter(
      (t) => t.folderId === folderId,
    );
    return this.deps.templates.insert({
      schoolId: input.scope.schoolId,
      subSchoolId: input.scope.subSchoolId,
      documentType: input.documentType,
      name: input.name,
      draftLayout: input.layout,
      createdBy: actor.userId,
      folderId,
      position: siblings.length,
    });
  }

  // ── The school's tree: folders and how templates are filed ─────────────

  private async folder(actor: Actor, id: string, schoolId?: string): Promise<DocumentFolder> {
    const folder = await this.deps.folders.findById(id);
    if (
      !folder ||
      !canAccess(actor, folder.schoolId) ||
      (schoolId && folder.schoolId !== schoolId)
    ) {
      throw new DocumentError('NOT_FOUND', `Folder ${id} not found`);
    }
    return folder;
  }

  async library(actor: Actor, schoolId: string): Promise<TemplateLibrary> {
    if (!canAccess(actor, schoolId)) return { folders: [], templates: [] };
    const [folders, templates] = await Promise.all([
      this.deps.folders.listForSchool(schoolId),
      this.deps.templates.listForSchool(schoolId),
    ]);
    const byPosition = <T extends { position: number }>(a: T, b: T) => a.position - b.position;
    return {
      folders: folders.sort(byPosition),
      templates: templates.filter((t) => !t.archivedAt).sort(byPosition),
    };
  }

  async createFolder(
    actor: Actor,
    input: { schoolId: string; parentId: string | null; name: string },
  ): Promise<DocumentFolder> {
    if (!canAccess(actor, input.schoolId)) throw new DocumentError('NOT_FOUND', 'School not found');
    if (input.parentId) await this.folder(actor, input.parentId, input.schoolId);
    const siblings = (await this.deps.folders.listForSchool(input.schoolId)).filter(
      (f) => f.parentId === input.parentId,
    );
    return this.deps.folders.insert({
      schoolId: input.schoolId,
      parentId: input.parentId,
      name: input.name,
      position: siblings.length,
    });
  }

  async renameFolder(actor: Actor, id: string, name: string): Promise<void> {
    await this.folder(actor, id);
    await this.deps.folders.update(id, { name });
  }

  /** Moves a folder into another one (or to the root) at `index` among its sub-folders. */
  async moveFolder(
    actor: Actor,
    id: string,
    parentId: string | null,
    index: number,
  ): Promise<void> {
    const folder = await this.folder(actor, id);
    const all = await this.deps.folders.listForSchool(folder.schoolId);
    if (parentId) {
      await this.folder(actor, parentId, folder.schoolId);
      // A folder cannot go inside itself or one of its own sub-folders.
      for (
        let at: string | null = parentId;
        at;
        at = all.find((f) => f.id === at)?.parentId ?? null
      ) {
        if (at === id) throw new DocumentError('CONFLICT', 'A folder cannot go inside itself');
      }
    }
    if (folder.parentId !== parentId) await this.deps.folders.update(id, { parentId });
    const updates = reorder(
      all.filter((f) => f.parentId === parentId),
      id,
      index,
    );
    if (folder.parentId !== parentId) {
      // Closes the gap left in the folder it came from.
      updates.push(...compact(all.filter((f) => f.parentId === folder.parentId && f.id !== id)));
    }
    for (const { id: itemId, position } of updates) {
      if (itemId === id || all.find((f) => f.id === itemId)?.position !== position) {
        await this.deps.folders.update(itemId, { position });
      }
    }
  }

  /** Only an empty folder goes: no sub-folder, no template. */
  async deleteFolder(actor: Actor, id: string): Promise<void> {
    const folder = await this.folder(actor, id);
    const [folders, templates] = await Promise.all([
      this.deps.folders.listForSchool(folder.schoolId),
      this.deps.templates.listForSchool(folder.schoolId),
    ]);
    if (
      folders.some((f) => f.parentId === id) ||
      templates.some((t) => t.folderId === id && !t.archivedAt)
    ) {
      throw new DocumentError('CONFLICT', 'The folder is not empty');
    }
    // Archived templates stay filed nowhere rather than in a missing folder.
    for (const t of templates.filter((t) => t.folderId === id)) {
      await this.deps.templates.update(t.id, { folderId: null });
    }
    await this.deps.folders.delete(id);
  }

  async renameTemplate(actor: Actor, id: string, name: string): Promise<void> {
    await this.get(actor, id);
    await this.deps.templates.update(id, { name });
  }

  /** Files a template in a folder (or at the root) at `index` among its templates. */
  async moveTemplate(
    actor: Actor,
    id: string,
    folderId: string | null,
    index: number,
  ): Promise<void> {
    const template = await this.get(actor, id);
    if (folderId) await this.folder(actor, folderId, template.schoolId);
    const all = (await this.deps.templates.listForSchool(template.schoolId)).filter(
      (t) => !t.archivedAt,
    );
    if (template.folderId !== folderId) await this.deps.templates.update(id, { folderId });
    const updates = reorder(
      all.filter((t) => t.folderId === folderId),
      id,
      index,
    );
    if (template.folderId !== folderId) {
      updates.push(...compact(all.filter((t) => t.folderId === template.folderId && t.id !== id)));
    }
    for (const { id: itemId, position } of updates) {
      if (itemId === id || all.find((t) => t.id === itemId)?.position !== position) {
        await this.deps.templates.update(itemId, { position });
      }
    }
  }

  /** A new template with the same draft, in the same folder, never published. */
  async duplicate(actor: Actor, id: string, name: string): Promise<DocumentTemplate> {
    const source = await this.get(actor, id);
    const layout =
      source.draftLayout ??
      (source.activeVersion !== null
        ? (await this.deps.templates.findVersion(id, source.activeVersion))?.layout
        : undefined);
    if (!layout) throw new DocumentError('NOT_FOUND', 'The template has nothing to copy');
    return this.create(actor, {
      scope: { schoolId: source.schoolId, subSchoolId: source.subSchoolId },
      documentType: source.documentType,
      name,
      layout,
      folderId: source.folderId,
    });
  }

  /**
   * Deletes a template never published. A published one is archived instead:
   * its versions prove what the issued documents were made from.
   */
  async remove(actor: Actor, id: string): Promise<'deleted' | 'archived'> {
    await this.get(actor, id);
    if ((await this.deps.templates.latestVersion(id)) === 0) {
      await this.deps.templates.delete(id);
      return 'deleted';
    }
    await this.deps.templates.archive(id, this.deps.now());
    return 'archived';
  }

  /** Saves the draft only: the active version and issued documents do not move. */
  async saveDraft(actor: Actor, id: string, layout: LayoutInput): Promise<void> {
    const template = await this.get(actor, id);
    if (template.archivedAt) throw new DocumentError('CONFLICT', 'The template is archived');
    await this.check(template, layout);
    await this.deps.templates.saveDraft(id, layout);
  }

  /**
   * Renders the draft (or a given version, or a layout being edited and not
   * saved yet) with the type's sample data, or with real data, under a
   * "BROUILLON" watermark. Nothing is stored.
   */
  async preview(
    actor: Actor,
    id: string,
    options: { version?: number; layout?: unknown; payload?: unknown } = {},
  ): Promise<Uint8Array> {
    const template = await this.get(actor, id);
    const type = getDocumentType(template.documentType);
    let layout: unknown = template.draftLayout;
    if (options.layout !== undefined) {
      // Same checks as saving, so an unsaved layout cannot point to another school's images.
      await this.check(template, options.layout);
      layout = options.layout;
    } else if (options.version !== undefined) {
      const version = await this.deps.templates.findVersion(id, options.version);
      if (!version) throw new DocumentError('NOT_FOUND', `Version ${options.version} not found`);
      layout = version.layout;
    }
    if (!layout) throw new DocumentError('NOT_FOUND', 'The template has no draft');
    return this.deps.renderer({
      type,
      layout,
      payload: options.payload ?? type.sample,
      document: {
        number: 'APERÇU',
        issuedAt: this.deps.now().toISOString().slice(0, 10),
        verifyUrl: 'https://example.org/verify/apercu',
      },
      assets: await loadLayoutAssets(this.deps.assets, template.schoolId, layout),
      draft: true,
    });
  }

  /** Validates the draft, stores it as version n + 1 and makes it active. */
  async publish(actor: Actor, id: string, note: string | null = null): Promise<TemplateVersion> {
    const template = await this.get(actor, id);
    if (template.archivedAt) throw new DocumentError('CONFLICT', 'The template is archived');
    if (!template.draftLayout) throw new DocumentError('NOT_FOUND', 'The template has no draft');
    await this.check(template, template.draftLayout);
    const version: TemplateVersion = {
      templateId: id,
      version: (await this.deps.templates.latestVersion(id)) + 1,
      layout: template.draftLayout,
      layoutFormat: LAYOUT_FORMAT,
      note,
      publishedBy: actor.userId,
      publishedAt: this.deps.now(),
    };
    // Two publications at once: the second one hits CONFLICT on the version number.
    await this.deps.templates.appendVersion(version);
    await this.deps.templates.setActive(id, version.version);
    return version;
  }

  /** Makes an older (or newer) published version active again. Nothing is deleted. */
  async activate(actor: Actor, id: string, version: number): Promise<void> {
    const template = await this.get(actor, id);
    if (template.archivedAt) throw new DocumentError('CONFLICT', 'The template is archived');
    if (!(await this.deps.templates.findVersion(id, version))) {
      throw new DocumentError('NOT_FOUND', `Version ${version} not found`);
    }
    await this.deps.templates.setActive(id, version);
  }

  /** The template stops being used; documents already issued with it stay valid. */
  async archive(actor: Actor, id: string): Promise<void> {
    await this.get(actor, id);
    await this.deps.templates.archive(id, this.deps.now());
  }

  /**
   * A template chosen by the person issuing (types with several templates):
   * it must be of this type, published, not archived, and belong to the
   * group or to this very sub-school.
   */
  async resolveChosen(
    scope: { schoolId: string; subSchoolId: string },
    type: DocumentTypeKey,
    templateId: string,
  ): Promise<ResolvedTemplate> {
    const template = await this.deps.templates.findById(templateId);
    const usable =
      template &&
      template.schoolId === scope.schoolId &&
      (template.subSchoolId === null || template.subSchoolId === scope.subSchoolId) &&
      template.documentType === type &&
      !template.archivedAt;
    if (!usable) throw new DocumentError('NOT_FOUND', `Template ${templateId} not found`);
    if (template.activeVersion === null) {
      throw new DocumentError('NO_TEMPLATE', `Template ${template.name} is not published yet`);
    }
    const version = await this.deps.templates.findVersion(template.id, template.activeVersion);
    if (!version)
      throw new DocumentError('NO_TEMPLATE', `Template ${template.name} has no version`);
    return { template, version };
  }

  /**
   * The template used to issue a document: the sub-school's own, else the
   * group's. A template without an active version does not count. No template
   * means NO_TEMPLATE, never a default design nobody chose.
   */
  async resolve(
    scope: { schoolId: string; subSchoolId: string },
    type: DocumentTypeKey,
  ): Promise<ResolvedTemplate> {
    for (const candidate of [scope, { schoolId: scope.schoolId, subSchoolId: null }]) {
      const template = await this.deps.templates.findForScope(candidate, type);
      if (template?.activeVersion != null) {
        const version = await this.deps.templates.findVersion(template.id, template.activeVersion);
        if (version) return { template, version };
      }
    }
    throw new DocumentError('NO_TEMPLATE', `No published ${type} template for this school`);
  }
}
