import { createDocuments, type Documents, type DocumentsConfig } from '@school-hub/documents';
import { AppError } from '@/shared/errors/app-error';
import { DrizzleAssetStore } from './adapters/drizzle-asset-store';
import { DrizzleFolderStore } from './adapters/drizzle-folder-store';
import { DrizzleIssuedDocumentStore } from './adapters/drizzle-issued-store';
import { DrizzleTemplateStore } from './adapters/drizzle-template-store';
import { S3FileStore } from './adapters/s3-file-store';
import { BulletinCollector } from './collectors/bulletin.collector';
import { FreeDocumentCollector } from './collectors/free.collector';

let documents: Documents | null = null;
let overrides: Partial<DocumentsConfig> = {};

/**
 * Built on first use, so APP_BASE_URL is only required by this module: a
 * deployment without it keeps working, and only the document routes answer
 * NOT_CONFIGURED.
 */
export function getDocuments(): Documents {
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
    files,
    assets: new DrizzleAssetStore(files),
    collectors: { bulletin: new BulletinCollector(), free: new FreeDocumentCollector() },
    ...overrides,
    verifyBaseUrl,
  });
  return documents;
}

/** Tests replace S3 or the clock; the next getDocuments() call rebuilds with them. */
export function configureDocuments(next: Partial<DocumentsConfig>): void {
  overrides = next;
  documents = null;
}
