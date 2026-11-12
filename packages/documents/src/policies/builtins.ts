import { getDocumentType } from '../document-types';
import type { DocumentTypeDefinition } from '../document-types/define';
import type { CheckImplementation } from './runtime';
import type { IssuingTx } from '../ports';

/** The period a document covers: its own (a term) or the numbering period. */
export function periodOf(type: DocumentTypeDefinition, payload: unknown, day: string): string {
  if (type.periodOf) return type.periodOf(payload);
  if (type.numbering?.period === 'schoolYear') return type.schoolYearOf!(payload);
  return day.slice(0, 4);
}

/**
 * The functions that only need what the package knows: the actor and the
 * issued documents. The backend gives the others.
 */
export function builtinPolicies(deps: { localDate(at: Date): string }): {
  requireRole: CheckImplementation<IssuingTx, 'requireRole'>;
  oncePerSubject: CheckImplementation<IssuingTx, 'oncePerSubject'>;
} {
  return {
    requireRole: async ({ args, actor }) => {
      if (actor.role && (args.roles as readonly string[]).includes(actor.role)) return undefined;
      return {
        refuse: 'ROLE_NOT_ALLOWED',
        message: `Only ${args.roles.join(', ')} may do this`,
      };
    },

    oncePerSubject: async ({
      args,
      tx,
      subject,
      documentType,
      schoolId,
      payload,
      today,
      replacesId,
    }) => {
      if (!subject) return undefined;
      const type = getDocumentType(documentType);
      const keyOf = (data: unknown, day: string) => {
        if (args.per === 'ever') return '';
        if (args.per === 'month') return day.slice(0, 7);
        return periodOf(type, data, day);
      };
      const own = keyOf(payload, today);
      // Read after the subject lock: a concurrent issue for the same subject has committed by now.
      const valid = await tx.listIssued({
        schoolId,
        documentType,
        subjectType: subject.type,
        subjectId: subject.id,
        status: 'issued',
      });
      const twin = valid.find(
        (doc) => doc.id !== replacesId && keyOf(doc.payload, deps.localDate(doc.issuedAt)) === own,
      );
      if (!twin) return undefined;
      const span =
        args.per === 'ever' ? '' : args.per === 'month' ? ' this month' : ' for this period';
      return {
        refuse: 'ALREADY_ISSUED',
        message: `${twin.number} is already valid${span}: correct it instead`,
      };
    },
  };
}
