import type { DocumentTypeKey } from './document-types/define';
import { renderDocument, type PdfRenderer } from './engine/render';
import { IssuingService } from './issuing/issuing-service';
import { builtinPolicies } from './policies/builtins';
import { OutboxService, OutboxWorker } from './policies/outbox';
import { PolicyService } from './policies/policy-service';
import { PolicyRunner, type PolicyImplementations } from './policies/runtime';
import type {
  AssetStore,
  Collector,
  FileStore,
  FolderStore,
  IssuedDocumentStore,
  IssuingTx,
  OutboxEntry,
  OutboxStore,
  PolicyStore,
  TemplateStore,
} from './ports';
import { TemplateService } from './templates/template-service';

export interface DocumentsConfig<Tx extends IssuingTx = IssuingTx> {
  templates: TemplateStore;
  folders: FolderStore;
  issued: IssuedDocumentStore<Tx>;
  policies: PolicyStore;
  outbox: OutboxStore;
  /**
   * The policy functions that read the application's tables. requireRole and
   * oncePerSubject come with the package; a function without implementation
   * cannot be used in a policy.
   */
  policyFunctions?: PolicyImplementations<Tx>;
  /** Called when an after… action fails, before it is retried. */
  onOutboxError?: (error: unknown, entry: OutboxEntry | null) => void;
  files: FileStore;
  assets: AssetStore;
  collectors: Partial<Record<DocumentTypeKey, Collector>>;
  /** Base of the QR code links, e.g. https://app.example.org. Required: no default URL. */
  verifyBaseUrl: string;
  renderer?: PdfRenderer;
  now?: () => Date;
  /** Time zone of the dates printed on documents. */
  timeZone?: string;
}

export interface Documents<Tx extends IssuingTx = IssuingTx> {
  templates: TemplateService;
  issuing: IssuingService<Tx>;
  policies: PolicyService;
  outbox: OutboxService;
  /** Not started: the application starts it with its server, and never in tests. */
  worker: OutboxWorker;
}

/** The single entry point of the package: the backend passes its stores and collectors. */
export function createDocuments<Tx extends IssuingTx = IssuingTx>(
  config: DocumentsConfig<Tx>,
): Documents<Tx> {
  let base: URL;
  try {
    base = new URL(config.verifyBaseUrl);
  } catch {
    throw new Error(
      `verifyBaseUrl must be an absolute URL, got ${JSON.stringify(config.verifyBaseUrl)}`,
    );
  }
  if (base.protocol !== 'https:' && base.protocol !== 'http:') {
    throw new Error('verifyBaseUrl must be an http(s) URL');
  }

  const renderer = config.renderer ?? renderDocument;
  const now = config.now ?? (() => new Date());
  const templates = new TemplateService({
    templates: config.templates,
    folders: config.folders,
    assets: config.assets,
    renderer,
    now,
  });
  const timeZone = config.timeZone ?? 'Africa/Kinshasa';
  const localDate = (at: Date) =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(at);
  const runner = new PolicyRunner<Tx>({
    ...config.policyFunctions,
    ...builtinPolicies({ localDate }),
  } as PolicyImplementations<Tx>);
  const policies = new PolicyService({
    policies: config.policies,
    implemented: () => runner.implemented(),
    now,
  });
  const issuing = new IssuingService<Tx>({
    templates,
    policies,
    runner,
    issued: config.issued,
    files: config.files,
    assets: config.assets,
    collectors: config.collectors,
    renderer,
    verifyBaseUrl: base.toString().replace(/\/+$/, ''),
    now,
    timeZone,
  });
  const outbox = new OutboxService({ outbox: config.outbox, now });
  const worker = new OutboxWorker({
    outbox: config.outbox,
    issued: config.issued,
    runner,
    now,
    onError: config.onOutboxError,
  });
  return { templates, issuing, policies, outbox, worker };
}
