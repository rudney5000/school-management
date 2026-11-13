import { and, asc, eq, isNull, max } from 'drizzle-orm';
import {
  DocumentError,
  type DocumentTemplate,
  type DocumentTypeKey,
  type LayoutInput,
  type NewTemplate,
  type Scope,
  type TemplateStore,
  type TemplateVersion,
} from '@school-hub/documents';
import { db } from '@/db';
import { documentTemplates, documentTemplateVersions } from '@/db/schema';
import { isUniqueViolation } from '@/shared/utils/pg-errors';

type TemplateRow = typeof documentTemplates.$inferSelect;
type VersionRow = typeof documentTemplateVersions.$inferSelect;

const toTemplate = (row: TemplateRow): DocumentTemplate => ({
  ...row,
  draftLayout: row.draftLayout as LayoutInput | null,
});

const toVersion = (row: VersionRow): TemplateVersion => ({
  ...row,
  layout: row.layout as LayoutInput,
});

export class DrizzleTemplateStore implements TemplateStore {
  async findById(id: string) {
    const [row] = await db.select().from(documentTemplates).where(eq(documentTemplates.id, id));
    return row ? toTemplate(row) : null;
  }

  async findForScope(scope: Scope, type: DocumentTypeKey) {
    const [row] = await db
      .select()
      .from(documentTemplates)
      .where(
        and(
          eq(documentTemplates.schoolId, scope.schoolId),
          scope.subSchoolId === null
            ? isNull(documentTemplates.subSchoolId)
            : eq(documentTemplates.subSchoolId, scope.subSchoolId),
          eq(documentTemplates.documentType, type),
          isNull(documentTemplates.archivedAt),
        ),
      );
    return row ? toTemplate(row) : null;
  }

  async listForSchool(schoolId: string) {
    const rows = await db
      .select()
      .from(documentTemplates)
      .where(eq(documentTemplates.schoolId, schoolId))
      .orderBy(asc(documentTemplates.documentType), asc(documentTemplates.createdAt));
    return rows.map(toTemplate);
  }

  async insert(template: NewTemplate) {
    try {
      const [row] = await db.insert(documentTemplates).values(template).returning();
      return toTemplate(row!);
    } catch (error) {
      // Two creations at once: the partial unique index lets only one through.
      if (isUniqueViolation(error)) {
        throw new DocumentError(
          'CONFLICT',
          `A ${template.documentType} template already exists here`,
        );
      }
      throw error;
    }
  }

  async saveDraft(id: string, layout: LayoutInput) {
    await db
      .update(documentTemplates)
      .set({ draftLayout: layout, updatedAt: new Date() })
      .where(eq(documentTemplates.id, id));
  }

  async findVersion(id: string, version: number) {
    const [row] = await db
      .select()
      .from(documentTemplateVersions)
      .where(
        and(
          eq(documentTemplateVersions.templateId, id),
          eq(documentTemplateVersions.version, version),
        ),
      );
    return row ? toVersion(row) : null;
  }

  async listVersions(id: string) {
    const rows = await db
      .select()
      .from(documentTemplateVersions)
      .where(eq(documentTemplateVersions.templateId, id))
      .orderBy(asc(documentTemplateVersions.version));
    return rows.map(toVersion);
  }

  async latestVersion(id: string) {
    const [row] = await db
      .select({ latest: max(documentTemplateVersions.version) })
      .from(documentTemplateVersions)
      .where(eq(documentTemplateVersions.templateId, id));
    return row?.latest ?? 0;
  }

  async appendVersion(version: TemplateVersion) {
    try {
      await db.insert(documentTemplateVersions).values(version);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DocumentError('CONFLICT', `Version ${version.version} was published meanwhile`);
      }
      throw error;
    }
  }

  async setActive(id: string, version: number) {
    await db
      .update(documentTemplates)
      .set({ activeVersion: version, updatedAt: new Date() })
      .where(eq(documentTemplates.id, id));
  }

  async update(
    id: string,
    patch: Partial<Pick<DocumentTemplate, 'name' | 'folderId' | 'position'>>,
  ) {
    await db
      .update(documentTemplates)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(documentTemplates.id, id));
  }

  async delete(id: string) {
    // The foreign key of document_template_versions refuses it once published.
    await db.delete(documentTemplates).where(eq(documentTemplates.id, id));
  }

  async archive(id: string, at: Date) {
    await db
      .update(documentTemplates)
      .set({ archivedAt: at, updatedAt: at })
      .where(and(eq(documentTemplates.id, id), isNull(documentTemplates.archivedAt)));
  }
}
