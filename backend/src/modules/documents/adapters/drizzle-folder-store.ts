import { asc, eq } from 'drizzle-orm';
import type { DocumentFolder, FolderStore } from '@school-hub/documents';
import { db } from '@/db';
import { documentFolders } from '@/db/schema';

export class DrizzleFolderStore implements FolderStore {
  async listForSchool(schoolId: string) {
    return db
      .select()
      .from(documentFolders)
      .where(eq(documentFolders.schoolId, schoolId))
      .orderBy(asc(documentFolders.position));
  }

  async findById(id: string) {
    const [row] = await db.select().from(documentFolders).where(eq(documentFolders.id, id));
    return row ?? null;
  }

  async insert(folder: Pick<DocumentFolder, 'schoolId' | 'parentId' | 'name' | 'position'>) {
    const [row] = await db.insert(documentFolders).values(folder).returning();
    return row!;
  }

  async update(id: string, patch: Partial<Pick<DocumentFolder, 'name' | 'parentId' | 'position'>>) {
    await db
      .update(documentFolders)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(documentFolders.id, id));
  }

  async delete(id: string) {
    await db.delete(documentFolders).where(eq(documentFolders.id, id));
  }
}
