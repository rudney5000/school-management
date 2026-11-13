import { and, asc, eq, isNull, max } from 'drizzle-orm';
import {
  DocumentError,
  type DocumentPolicy,
  type DocumentTypeKey,
  type NewPolicy,
  type PolicyStep,
  type PolicyStore,
  type PolicyVersion,
  type Scope,
} from '@school-hub/documents';
import { db } from '@/db';
import { documentPolicies, documentPolicyVersions } from '@/db/schema';
import { isUniqueViolation } from '@/shared/utils/pg-errors';

type PolicyRow = typeof documentPolicies.$inferSelect;
type VersionRow = typeof documentPolicyVersions.$inferSelect;

const toPolicy = (row: PolicyRow): DocumentPolicy => ({
  ...row,
  draftSteps: row.draftSteps as PolicyStep[] | null,
});

const toVersion = (row: VersionRow): PolicyVersion => ({
  ...row,
  steps: row.steps as PolicyStep[],
});

export class DrizzlePolicyStore implements PolicyStore {
  async findById(id: string) {
    const [row] = await db.select().from(documentPolicies).where(eq(documentPolicies.id, id));
    return row ? toPolicy(row) : null;
  }

  async findForScope(scope: Scope, type: DocumentTypeKey) {
    const [row] = await db
      .select()
      .from(documentPolicies)
      .where(
        and(
          eq(documentPolicies.schoolId, scope.schoolId),
          scope.subSchoolId === null
            ? isNull(documentPolicies.subSchoolId)
            : eq(documentPolicies.subSchoolId, scope.subSchoolId),
          eq(documentPolicies.documentType, type),
          isNull(documentPolicies.archivedAt),
        ),
      );
    return row ? toPolicy(row) : null;
  }

  async listForSchool(schoolId: string) {
    const rows = await db
      .select()
      .from(documentPolicies)
      .where(eq(documentPolicies.schoolId, schoolId))
      .orderBy(asc(documentPolicies.documentType), asc(documentPolicies.createdAt));
    return rows.map(toPolicy);
  }

  async insert(policy: NewPolicy) {
    try {
      const [row] = await db.insert(documentPolicies).values(policy).returning();
      return toPolicy(row!);
    } catch (error) {
      // Two creations at once: the partial unique index lets only one through.
      if (isUniqueViolation(error)) {
        throw new DocumentError('CONFLICT', `A ${policy.documentType} policy already exists here`);
      }
      throw error;
    }
  }

  async saveDraft(id: string, steps: PolicyStep[]) {
    await db
      .update(documentPolicies)
      .set({ draftSteps: steps, updatedAt: new Date() })
      .where(eq(documentPolicies.id, id));
  }

  async findVersion(id: string, version: number) {
    const [row] = await db
      .select()
      .from(documentPolicyVersions)
      .where(
        and(eq(documentPolicyVersions.policyId, id), eq(documentPolicyVersions.version, version)),
      );
    return row ? toVersion(row) : null;
  }

  async listVersions(id: string) {
    const rows = await db
      .select()
      .from(documentPolicyVersions)
      .where(eq(documentPolicyVersions.policyId, id))
      .orderBy(asc(documentPolicyVersions.version));
    return rows.map(toVersion);
  }

  async latestVersion(id: string) {
    const [row] = await db
      .select({ latest: max(documentPolicyVersions.version) })
      .from(documentPolicyVersions)
      .where(eq(documentPolicyVersions.policyId, id));
    return row?.latest ?? 0;
  }

  async appendVersion(version: PolicyVersion) {
    try {
      await db.insert(documentPolicyVersions).values(version);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new DocumentError('CONFLICT', `Version ${version.version} already exists`);
      }
      throw error;
    }
  }

  async setActive(id: string, version: number) {
    await db
      .update(documentPolicies)
      .set({ activeVersion: version, updatedAt: new Date() })
      .where(eq(documentPolicies.id, id));
  }

  async archive(id: string, at: Date) {
    await db
      .update(documentPolicies)
      .set({ archivedAt: at, updatedAt: at })
      .where(eq(documentPolicies.id, id));
  }
}
