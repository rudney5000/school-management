import 'dotenv/config';
import { and, eq, isNull } from 'drizzle-orm';
import { bulletinOfficielRdc, LAYOUT_FORMAT } from '@school-hub/documents';
import { db } from './index';
import { documentTemplates, documentTemplateVersions, subSchools, users, workers } from './schema';

const OWNER_EMAIL = 'directeur@saintjoseph.cd';

/**
 * Publishes the "Officiel RDC" bulletin template for the group of the seeded
 * director, so bulletins can be issued right away. Safe to run again: it does
 * nothing when the group already has a bulletin template.
 */
export async function seedDocumentTemplates(): Promise<void> {
  const [owner] = await db
    .select({ id: users.id, schoolId: subSchools.schoolId })
    .from(users)
    .innerJoin(workers, eq(workers.id, users.workerId))
    .innerJoin(subSchools, eq(subSchools.id, workers.subSchoolId))
    .where(eq(users.email, OWNER_EMAIL));
  if (!owner) {
    console.log(`⚠ ${OWNER_EMAIL} not found, skip document templates`);
    return;
  }

  const [existing] = await db
    .select({ id: documentTemplates.id })
    .from(documentTemplates)
    .where(
      and(
        eq(documentTemplates.schoolId, owner.schoolId),
        isNull(documentTemplates.subSchoolId),
        eq(documentTemplates.documentType, bulletinOfficielRdc.documentType),
        isNull(documentTemplates.archivedAt),
      ),
    );
  if (existing) {
    console.log('~ Document template already exists');
    return;
  }

  await db.transaction(async (tx) => {
    const [template] = await tx
      .insert(documentTemplates)
      .values({
        schoolId: owner.schoolId,
        subSchoolId: null,
        documentType: bulletinOfficielRdc.documentType,
        name: bulletinOfficielRdc.name,
        draftLayout: bulletinOfficielRdc.layout,
        activeVersion: null,
        createdBy: owner.id,
      })
      .returning();
    await tx.insert(documentTemplateVersions).values({
      templateId: template!.id,
      version: 1,
      layout: bulletinOfficielRdc.layout,
      layoutFormat: LAYOUT_FORMAT,
      note: 'Modèle de départ',
      publishedBy: owner.id,
    });
    await tx
      .update(documentTemplates)
      .set({ activeVersion: 1 })
      .where(eq(documentTemplates.id, template!.id));
  });
  console.log(`✓ Document template: bulletin « ${bulletinOfficielRdc.name} »`);
}

if (require.main === module) {
  seedDocumentTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('✗ Seed failed:', err);
      process.exit(1);
    });
}
