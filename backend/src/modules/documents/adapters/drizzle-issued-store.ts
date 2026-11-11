import { and, desc, eq, sql, type SQL } from 'drizzle-orm';
import {
  DocumentError,
  type DocumentTypeKey,
  type IssuedDocument,
  type IssuedDocumentStore,
  type IssuedFilter,
  type IssuingTx,
} from '@school-hub/documents';
import { db } from '@/db';
import { documentNumberSequences, issuedDocuments } from '@/db/schema';

type Db = typeof db;
type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];
type IssuedRow = typeof issuedDocuments.$inferSelect;

const toDocument = ({ signedByUserId: _s, signedAt: _a, ...row }: IssuedRow): IssuedDocument => row;

class DrizzleIssuingTx implements IssuingTx {
  constructor(private readonly tx: Tx) {}

  /**
   * One statement creates the counter or increments it. The row stays locked
   * until the transaction ends: a concurrent issue for the same sub-school,
   * type and period waits, and a rollback gives the number back.
   */
  async nextNumber(subSchoolId: string, type: DocumentTypeKey, period: string) {
    const [row] = await this.tx
      .insert(documentNumberSequences)
      .values({ subSchoolId, documentType: type, period, lastNumber: 1 })
      .onConflictDoUpdate({
        target: [
          documentNumberSequences.subSchoolId,
          documentNumberSequences.documentType,
          documentNumberSequences.period,
        ],
        set: {
          lastNumber: sql`${documentNumberSequences.lastNumber} + 1`,
          updatedAt: sql`now()`,
        },
      })
      .returning({ lastNumber: documentNumberSequences.lastNumber });
    return row!.lastNumber;
  }

  async insert(doc: IssuedDocument) {
    await this.tx.insert(issuedDocuments).values(doc);
  }

  async revoke(id: string, reason: string, at: Date) {
    // The status condition makes two concurrent revocations or corrections race
    // on the row lock: the second one finds the document already revoked.
    const updated = await this.tx
      .update(issuedDocuments)
      .set({ status: 'revoked', revokedAt: at, revokedReason: reason })
      .where(and(eq(issuedDocuments.id, id), eq(issuedDocuments.status, 'issued')))
      .returning({ id: issuedDocuments.id });
    if (updated.length === 0) throw new DocumentError('CONFLICT', 'Already revoked');
  }
}

export class DrizzleIssuedDocumentStore implements IssuedDocumentStore {
  transaction<T>(work: (tx: IssuingTx) => Promise<T>): Promise<T> {
    return db.transaction((tx) => work(new DrizzleIssuingTx(tx)));
  }

  async findById(id: string) {
    const [row] = await db.select().from(issuedDocuments).where(eq(issuedDocuments.id, id));
    return row ? toDocument(row) : null;
  }

  async list(filter: IssuedFilter) {
    const conditions: SQL[] = [];
    if (filter.schoolId) conditions.push(eq(issuedDocuments.schoolId, filter.schoolId));
    if (filter.subSchoolId) conditions.push(eq(issuedDocuments.subSchoolId, filter.subSchoolId));
    if (filter.documentType) {
      conditions.push(eq(issuedDocuments.documentType, filter.documentType));
    }
    if (filter.subjectType) conditions.push(eq(issuedDocuments.subjectType, filter.subjectType));
    if (filter.subjectId) conditions.push(eq(issuedDocuments.subjectId, filter.subjectId));
    if (filter.replacesId) conditions.push(eq(issuedDocuments.replacesId, filter.replacesId));

    const query = db
      .select()
      .from(issuedDocuments)
      .where(and(...conditions))
      .orderBy(desc(issuedDocuments.issuedAt));
    const rows = filter.limit === undefined ? await query : await query.limit(filter.limit);
    return rows.map(toDocument);
  }
}
