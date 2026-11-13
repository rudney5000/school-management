import { createDocuments, type Documents, type DocumentsConfig } from '@school-hub/documents';
import { AppError } from '@/shared/errors/app-error';
import { DrizzleAssetStore } from './adapters/drizzle-asset-store';
import { DrizzleFolderStore } from './adapters/drizzle-folder-store';
import { DrizzleIssuedDocumentStore, type DrizzleIssuingTx } from './adapters/drizzle-issued-store';
import { DrizzleOutboxStore } from './adapters/drizzle-outbox-store';
import { DrizzlePolicyStore } from './adapters/drizzle-policy-store';
import { DrizzleTemplateStore } from './adapters/drizzle-template-store';
import { S3FileStore } from './adapters/s3-file-store';
import { BulletinCollector } from './collectors/bulletin.collector';
import { FreeDocumentCollector } from './collectors/free.collector';
import { policyFunctions } from './policies/policy-functions';

type BackendDocuments = Documents<DrizzleIssuingTx>;
type BackendConfig = DocumentsConfig<DrizzleIssuingTx>;

let documents: BackendDocuments | null = null;
let overrides: Partial<BackendConfig> = {};

/**
 * Built on first use, so APP_BASE_URL is only required by this module: a
 * deployment without it keeps working, and only the document routes answer
 * NOT_CONFIGURED.
 */
export function getDocuments(): BackendDocuments {
  if (documents) return documents;

  const verifyBaseUrl = overrides.verifyBaseUrl ?? process.env.APP_BASE_URL;
  if (!verifyBaseUrl) {
    throw new AppError(
      'NOT_CONFIGURED',
      'APP_BASE_URL is not set: the QR codes of documents need the address of the app',
      503,
    );
  }

  const files = overrides.files ?? new S3FileStore();
  documents = createDocuments({
    templates: new DrizzleTemplateStore(),
    folders: new DrizzleFolderStore(),
    issued: new DrizzleIssuedDocumentStore(),
    policies: new DrizzlePolicyStore(),
    outbox: new DrizzleOutboxStore(),
    policyFunctions,
    onOutboxError: (error, entry) =>
      console.error(
        entry ? `Document action ${entry.fn} (${entry.id}) failed:` : 'Document worker failed:',
        error instanceof Error ? error.message : error,
      ),
    files,
    assets: new DrizzleAssetStore(files),
    collectors: { bulletin: new BulletinCollector(), free: new FreeDocumentCollector() },
    ...overrides,
    verifyBaseUrl,
  });
  return documents;
}

/** Tests replace S3 or the clock; the next getDocuments() call rebuilds with them. */
export function configureDocuments(next: Partial<BackendConfig>): void {
  overrides = next;
  documents = null;
}

/**
 * Runs the after… actions of issued documents every 5 seconds. Started with
 * the server, never in tests (they call worker.runOnce()). Without
 * APP_BASE_URL documents are off, and so is the worker.
 */
export function startDocumentWorker(intervalMs = 5_000): (() => Promise<void>) | null {
  let worker;
  try {
    worker = getDocuments().worker;
  } catch (error) {
    if (error instanceof AppError && error.code === 'NOT_CONFIGURED') {
      console.warn('Document worker not started:', error.message);
      return null;
    }
    throw error;
  }
  worker.start(intervalMs);
  return () => worker.stop();
}
