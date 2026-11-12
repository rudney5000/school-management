import { getDocumentType } from '../document-types';
import type { DocumentTypeKey } from '../document-types/define';
import { DocumentError, type LayoutIssue } from '../errors';
import type { PolicyStep } from '../ports';
import { getPolicyFunction } from './catalog';
import { POLICY_EVENTS, type PolicyEvent } from './define';

export const MAX_POLICY_STEPS = 20;

export interface PolicyValidation {
  ok: boolean;
  /** The steps with their args parsed: defaults filled in, as they will run. */
  steps: PolicyStep[];
  issues: LayoutIssue[];
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Checks steps against the catalogue: known function, allowed event, args
 * matching the function, a subject the function can work on, and a function
 * this deployment implements.
 */
export function validatePolicySteps(
  input: unknown,
  options: { documentType: DocumentTypeKey; implemented: ReadonlySet<string> },
): PolicyValidation {
  const issues: LayoutIssue[] = [];
  const steps: PolicyStep[] = [];
  const issue = (code: LayoutIssue['code'], path: string, message: string) =>
    issues.push({ code, path, message });

  if (!Array.isArray(input)) {
    issue('INVALID_POLICY', 'steps', 'steps must be a list');
    return { ok: false, steps, issues };
  }
  if (input.length > MAX_POLICY_STEPS) {
    issue('TOO_MANY_STEPS', 'steps', `At most ${MAX_POLICY_STEPS} steps, got ${input.length}`);
  }
  const subject = getDocumentType(options.documentType).subject;

  for (const [i, raw] of input.entries()) {
    const path = `steps.${i}`;
    if (!isObject(raw)) {
      issue('INVALID_POLICY', path, 'A step is an object');
      continue;
    }
    const extra = Object.keys(raw).filter((key) => !['on', 'fn', 'args'].includes(key));
    if (extra.length) issue('INVALID_POLICY', path, `Unknown keys: ${extra.join(', ')}`);

    const fn = typeof raw.fn === 'string' ? getPolicyFunction(raw.fn) : null;
    if (!fn) {
      issue('UNKNOWN_FUNCTION', `${path}.fn`, `Unknown function ${String(raw.fn)}`);
      continue;
    }
    if (!options.implemented.has(fn.name)) {
      issue('UNKNOWN_FUNCTION', `${path}.fn`, `${fn.name} is not available here yet`);
      continue;
    }

    const on = raw.on as PolicyEvent;
    if (!POLICY_EVENTS.includes(on)) {
      issue('EVENT_NOT_ALLOWED', `${path}.on`, `Unknown event ${String(raw.on)}`);
      continue;
    }
    if (!(fn.events as readonly string[]).includes(on)) {
      issue(
        'EVENT_NOT_ALLOWED',
        `${path}.on`,
        `${fn.name} runs on ${fn.events.join(', ')}, not on ${on}`,
      );
      continue;
    }
    if (fn.subjects && (subject === null || !fn.subjects.includes(subject))) {
      issue(
        'FUNCTION_NOT_ALLOWED',
        `${path}.fn`,
        `${fn.name} needs a document about a ${fn.subjects.join(' or ')}`,
      );
      continue;
    }

    const args = fn.args.safeParse(raw.args ?? {});
    if (!args.success) {
      for (const problem of args.error.issues) {
        const where = problem.path.length ? `.${problem.path.join('.')}` : '';
        issue('INVALID_ARGS', `${path}.args${where}`, problem.message);
      }
      continue;
    }
    steps.push({ on, fn: fn.name, args: args.data as Record<string, unknown> });
  }

  return { ok: issues.length === 0, steps, issues };
}

/** Throws INVALID_POLICY with every issue, or returns the parsed steps. */
export function assertPolicySteps(
  input: unknown,
  options: Parameters<typeof validatePolicySteps>[1],
): PolicyStep[] {
  const result = validatePolicySteps(input, options);
  if (!result.ok) {
    throw new DocumentError('INVALID_POLICY', 'The policy is not valid', result.issues);
  }
  return result.steps;
}
