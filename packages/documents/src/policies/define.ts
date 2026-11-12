import type { z } from 'zod';
import type { SubjectType } from '../document-types/define';

/** When a step of a policy runs. */
export const POLICY_EVENTS = ['beforeIssue', 'afterIssue', 'beforeRevoke', 'afterRevoke'] as const;
export type PolicyEvent = (typeof POLICY_EVENTS)[number];

/** A `before…` step checks and may refuse, inside the transaction. */
export type CheckEvent = 'beforeIssue' | 'beforeRevoke';
/** An `after…` step acts later, through the outbox, and is retried until it succeeds. */
export type ActionEvent = 'afterIssue' | 'afterRevoke';

/** Codes a check may refuse with. They are shown to the person issuing. */
export const REFUSAL_CODES = [
  'FEES_UNPAID',
  'MISSING_GRADES',
  'ATTENDANCE_TOO_LOW',
  'ALREADY_ISSUED',
  'ROLE_NOT_ALLOWED',
] as const;
export type RefusalCode = (typeof REFUSAL_CODES)[number];

interface BaseDefinition<N extends string, A extends z.ZodTypeAny> {
  name: N;
  /** Shown in the back-office next to the function. */
  description: string;
  /** Validates the `args` of a step at publication. A step without args is parsed as `{}`. */
  args: A;
  /** The function needs a document about one of these subjects; any document when absent. */
  subjects?: readonly SubjectType[];
}

export interface CheckDefinition<
  N extends string = string,
  A extends z.ZodTypeAny = z.ZodTypeAny,
  R extends RefusalCode = RefusalCode,
> extends BaseDefinition<N, A> {
  kind: 'check';
  events: readonly CheckEvent[];
  refusals: readonly R[];
}

export interface ActionDefinition<
  N extends string = string,
  A extends z.ZodTypeAny = z.ZodTypeAny,
> extends BaseDefinition<N, A> {
  kind: 'action';
  events: readonly ActionEvent[];
}

export type PolicyFunctionDefinition = CheckDefinition | ActionDefinition;

/** The package only describes a function; what it does is given by the backend or the package. */
export function definePolicyFunction<const D extends PolicyFunctionDefinition>(definition: D): D {
  if (definition.events.length === 0) throw new Error(`${definition.name}: no event`);
  return definition;
}
