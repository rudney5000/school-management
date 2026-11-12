import { randomUUID } from 'node:crypto';
import {
  bulletin,
  bulletinOfficielRdc,
  freeDocument,
  createDocuments,
  type Actor,
  type Collector,
  type PdfRenderer,
  type PolicyImplementations,
} from '../src';
import {
  MemoryAssetStore,
  MemoryFileStore,
  MemoryFolderStore,
  MemoryIssuedDocumentStore,
  MemoryOutboxStore,
  MemoryPolicyStore,
  MemoryTemplateStore,
} from '../src/testing';

export const SCHOOL = 'school-saint-joseph';
export const OTHER_SCHOOL = 'school-sainte-marie';
export const GOMBE = 'sub-gombe';
export const LIMETE = 'sub-limete';

export const team: Actor = { userId: 'user-team', schoolId: null };
export const director: Actor = { userId: 'user-director', schoolId: SCHOOL };
export const stranger: Actor = { userId: 'user-other', schoolId: OTHER_SCHOOL };

export const layout = bulletinOfficielRdc.layout;

export const params = () => ({
  studentId: randomUUID(),
  classId: randomUUID(),
  academicPeriodId: randomUUID(),
});

/** A PDF stand-in that records what it was asked to draw, for tests that do not look at pixels. */
export function fakeRenderer() {
  const calls: Parameters<PdfRenderer>[0][] = [];
  const renderer: PdfRenderer = async (input) => {
    calls.push(input);
    return new TextEncoder().encode(`%PDF-fake ${input.document.number}`);
  };
  return { renderer, calls };
}

export function setup(
  options: {
    renderer?: PdfRenderer;
    collector?: Collector;
    now?: () => Date;
    policyFunctions?: PolicyImplementations;
  } = {},
) {
  const now = options.now ?? (() => new Date('2025-12-19T10:00:00Z'));
  const outbox = new MemoryOutboxStore();
  const stores = {
    templates: new MemoryTemplateStore(),
    folders: new MemoryFolderStore(),
    policies: new MemoryPolicyStore(),
    outbox,
    issued: new MemoryIssuedDocumentStore(outbox),
    files: new MemoryFileStore(),
    assets: new MemoryAssetStore(),
  };
  const collector: Collector = options.collector ?? { collect: async () => bulletin.sample };
  const documents = createDocuments({
    ...stores,
    collectors: { bulletin: collector, free: { collect: async () => freeDocument.sample } },
    verifyBaseUrl: 'https://app.example.org/',
    renderer: options.renderer,
    now,
    policyFunctions: options.policyFunctions,
  });
  // `outbox` is the service; the memory store stays reachable for assertions.
  return { ...stores, ...documents, outboxStore: outbox };
}

/** A group template for Saint-Joseph, published once. */
export async function publishedGroupTemplate(ctx: ReturnType<typeof setup>) {
  const template = await ctx.templates.create(team, {
    scope: { schoolId: SCHOOL, subSchoolId: null },
    documentType: 'bulletin',
    name: 'Bulletin du groupe',
    layout,
  });
  await ctx.templates.publish(team, template.id, 'Première version');
  return template;
}

export const gombeScope = { schoolId: SCHOOL, subSchoolId: GOMBE, subSchoolCode: 'SJG' };
