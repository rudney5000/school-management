import { getDocumentType } from '../document-types';
import type { DocumentTypeKey } from '../document-types/define';
import { DocumentError } from '../errors';
import type {
  Actor,
  DocumentPolicy,
  PolicyStep,
  PolicyStore,
  PolicyVersion,
  Scope,
} from '../ports';
import { canAccess } from '../templates/template-service';
import { POLICY_FUNCTIONS } from './catalog';
import { assertPolicySteps } from './validate';

export interface ResolvedPolicy {
  policy: DocumentPolicy;
  version: PolicyVersion;
}

/** How the back-office lists the catalogue. */
export interface PolicyFunctionInfo {
  name: string;
  kind: 'check' | 'action';
  description: string;
  events: readonly string[];
  subjects: readonly string[] | null;
  refusals: readonly string[];
  /** False when this deployment does not implement it yet: a policy cannot use it. */
  available: boolean;
}

export interface PolicyServiceDeps {
  policies: PolicyStore;
  implemented: () => ReadonlySet<string>;
  now: () => Date;
}

/** Drafts, publishes and resolves the policies of a school. Mirrors the templates. */
export class PolicyService {
  constructor(private readonly deps: PolicyServiceDeps) {}

  functions(): PolicyFunctionInfo[] {
    const implemented = this.deps.implemented();
    return Object.values(POLICY_FUNCTIONS).map((fn) => ({
      name: fn.name,
      kind: fn.kind,
      description: fn.description,
      events: fn.events,
      subjects: 'subjects' in fn ? fn.subjects : null,
      refusals: fn.kind === 'check' ? fn.refusals : [],
      available: implemented.has(fn.name),
    }));
  }

  private check(documentType: DocumentTypeKey, steps: unknown): PolicyStep[] {
    return assertPolicySteps(steps, { documentType, implemented: this.deps.implemented() });
  }

  private async get(actor: Actor, id: string): Promise<DocumentPolicy> {
    const policy = await this.deps.policies.findById(id);
    if (!policy || !canAccess(actor, policy.schoolId)) {
      throw new DocumentError('NOT_FOUND', `Policy ${id} not found`);
    }
    return policy;
  }

  async list(actor: Actor, schoolId: string): Promise<DocumentPolicy[]> {
    if (!canAccess(actor, schoolId)) return [];
    return this.deps.policies.listForSchool(schoolId);
  }

  async find(actor: Actor, id: string): Promise<DocumentPolicy> {
    return this.get(actor, id);
  }

  async versions(actor: Actor, id: string): Promise<PolicyVersion[]> {
    await this.get(actor, id);
    return this.deps.policies.listVersions(id);
  }

  async create(
    actor: Actor,
    input: { scope: Scope; documentType: DocumentTypeKey; steps: unknown },
  ): Promise<DocumentPolicy> {
    if (!canAccess(actor, input.scope.schoolId)) {
      throw new DocumentError('NOT_FOUND', 'School not found');
    }
    getDocumentType(input.documentType);
    const steps = this.check(input.documentType, input.steps);
    if (await this.deps.policies.findForScope(input.scope, input.documentType)) {
      throw new DocumentError('CONFLICT', `A ${input.documentType} policy already exists here`);
    }
    // Two creations at once: the second one hits the unique index, CONFLICT too.
    return this.deps.policies.insert({
      schoolId: input.scope.schoolId,
      subSchoolId: input.scope.subSchoolId,
      documentType: input.documentType,
      draftSteps: steps,
      createdBy: actor.userId,
    });
  }

  async saveDraft(actor: Actor, id: string, steps: unknown): Promise<void> {
    const policy = await this.get(actor, id);
    if (policy.archivedAt) throw new DocumentError('CONFLICT', 'The policy is archived');
    await this.deps.policies.saveDraft(id, this.check(policy.documentType, steps));
  }

  /** Checked again: the catalogue or the deployment may have changed since the draft was saved. */
  async publish(actor: Actor, id: string, note: string | null = null): Promise<PolicyVersion> {
    const policy = await this.get(actor, id);
    if (policy.archivedAt) throw new DocumentError('CONFLICT', 'The policy is archived');
    if (!policy.draftSteps) throw new DocumentError('NOT_FOUND', 'The policy has no draft');
    const version: PolicyVersion = {
      policyId: id,
      version: (await this.deps.policies.latestVersion(id)) + 1,
      steps: this.check(policy.documentType, policy.draftSteps),
      note,
      publishedBy: actor.userId,
      publishedAt: this.deps.now(),
    };
    await this.deps.policies.appendVersion(version);
    await this.deps.policies.setActive(id, version.version);
    return version;
  }

  /** Back to an earlier version, which must still be valid. */
  async activate(actor: Actor, id: string, version: number): Promise<void> {
    const policy = await this.get(actor, id);
    if (policy.archivedAt) throw new DocumentError('CONFLICT', 'The policy is archived');
    const found = await this.deps.policies.findVersion(id, version);
    if (!found) throw new DocumentError('NOT_FOUND', `Version ${version} not found`);
    this.check(policy.documentType, found.steps);
    await this.deps.policies.setActive(id, version);
  }

  /** The scope falls back to its group's policy, or to none. Versions stay for history. */
  async archive(actor: Actor, id: string): Promise<void> {
    const policy = await this.get(actor, id);
    if (policy.archivedAt) return;
    await this.deps.policies.archive(id, this.deps.now());
  }

  /** The sub-school's policy, else the group's. Null: no step, everything is allowed. */
  async resolve(
    scope: { schoolId: string; subSchoolId: string },
    type: DocumentTypeKey,
  ): Promise<ResolvedPolicy | null> {
    for (const candidate of [scope, { schoolId: scope.schoolId, subSchoolId: null }]) {
      const policy = await this.deps.policies.findForScope(candidate, type);
      if (policy?.activeVersion != null) {
        const version = await this.deps.policies.findVersion(policy.id, policy.activeVersion);
        if (version) return { policy, version };
      }
    }
    return null;
  }
}
