import { z } from 'zod';
import { definePolicyFunction, type PolicyFunctionDefinition } from './define';

/**
 * Payment types of the backend's `payments` table. Kept here so a policy is
 * validated without the backend; a backend test checks both lists match.
 */
export const PAYMENT_TYPES = [
  'TUITION',
  'CANTEEN',
  'UNIFORM',
  'EXAM_FEE',
  'TRANSPORT',
  'ACTIVITY',
  'OTHER',
] as const;

/** Roles of the backend's users. A backend test checks both lists match. */
export const USER_ROLES = [
  'super_admin',
  'admin',
  'director',
  'teacher',
  'worker',
  'parent',
  'student',
] as const;

export const requireFeesPaid = definePolicyFunction({
  name: 'requireFeesPaid',
  kind: 'check',
  description:
    'Refuse while the student owes more than the tolerance: unpaid (PENDING) payments due by the end of the period, or of the whole year.',
  events: ['beforeIssue'],
  subjects: ['student'],
  args: z
    .object({
      upTo: z.enum(['period', 'year']),
      toleranceFc: z.number().int().min(0).default(0),
      /** Only these kinds of payment; every kind when absent. */
      paymentTypes: z.array(z.enum(PAYMENT_TYPES)).min(1).optional(),
    })
    .strict(),
  refusals: ['FEES_UNPAID'],
});

export const requireAllGrades = definePolicyFunction({
  name: 'requireAllGrades',
  kind: 'check',
  description: 'Refuse while a course of the class has no grade for the student in the period.',
  events: ['beforeIssue'],
  subjects: ['student'],
  args: z.object({}).strict(),
  refusals: ['MISSING_GRADES'],
});

export const requireAttendance = definePolicyFunction({
  name: 'requireAttendance',
  kind: 'check',
  description:
    'Refuse when the student attended less than this share of the recorded days (late counts as present, excused days are left out).',
  events: ['beforeIssue'],
  subjects: ['student'],
  args: z.object({ minPercent: z.number().min(0).max(100) }).strict(),
  refusals: ['ATTENDANCE_TOO_LOW'],
});

export const oncePerSubject = definePolicyFunction({
  name: 'oncePerSubject',
  kind: 'check',
  description:
    'Refuse a second valid document of this type for the same subject in the period, the month, or ever. A correction replaces the old one and is allowed.',
  events: ['beforeIssue'],
  subjects: ['student', 'payment', 'class', 'level', 'teacher'],
  args: z.object({ per: z.enum(['period', 'month', 'ever']).default('period') }).strict(),
  refusals: ['ALREADY_ISSUED'],
});

export const requireRole = definePolicyFunction({
  name: 'requireRole',
  kind: 'check',
  description: 'Refuse unless the person issuing or revoking has one of these roles.',
  events: ['beforeIssue', 'beforeRevoke'],
  args: z.object({ roles: z.array(z.enum(USER_ROLES)).min(1) }).strict(),
  refusals: ['ROLE_NOT_ALLOWED'],
});

export const publishToParentPortal = definePolicyFunction({
  name: 'publishToParentPortal',
  kind: 'action',
  description: "Share the document with the student's parents, on their portal.",
  events: ['afterIssue'],
  subjects: ['student'],
  args: z.object({}).strict(),
});

/** The closed list a school picks from. A function absent from it cannot be used. */
export const POLICY_FUNCTIONS = {
  requireFeesPaid,
  requireAllGrades,
  requireAttendance,
  oncePerSubject,
  requireRole,
  publishToParentPortal,
} as const satisfies Record<string, PolicyFunctionDefinition>;

type Catalog = typeof POLICY_FUNCTIONS;
export type PolicyFunctionName = keyof Catalog;
export type CheckFunctionName = {
  [N in PolicyFunctionName]: Catalog[N]['kind'] extends 'check' ? N : never;
}[PolicyFunctionName];
export type ActionFunctionName = Exclude<PolicyFunctionName, CheckFunctionName>;
export type PolicyArgs<N extends PolicyFunctionName> = z.output<Catalog[N]['args']>;
export type RefusalOf<N extends CheckFunctionName> = Catalog[N]['refusals'][number];

export function getPolicyFunction(name: string): PolicyFunctionDefinition | null {
  return Object.prototype.hasOwnProperty.call(POLICY_FUNCTIONS, name)
    ? POLICY_FUNCTIONS[name as PolicyFunctionName]
    : null;
}
