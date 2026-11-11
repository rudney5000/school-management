import type { DocumentTypeKey } from './document-types/define';
import { renderDocument, type PdfRenderer } from './engine/render';
import { IssuingService } from './issuing/issuing-service';
import type {
  AssetStore,
  Collector,
  FileStore,
  FolderStore,
  IssuedDocumentStore,
  TemplateStore,
} from './ports';
import { TemplateService } from './templates/template-service';

export interface DocumentsConfig {
  templates: TemplateStore;
  folders: FolderStore;
  issued: IssuedDocumentStore;
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

export interface Documents {
  templates: TemplateService;
  issuing: IssuingService;
}

/** The single entry point of the package: the backend passes its stores and collectors. */
export function createDocuments(config: DocumentsConfig): Documents {
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
  const issuing = new IssuingService({
    templates,
    issued: config.issued,
    files: config.files,
    assets: config.assets,
    collectors: config.collectors,
    renderer,
    verifyBaseUrl: base.toString().replace(/\/+$/, ''),
    now,
    timeZone: config.timeZone ?? 'Africa/Kinshasa',
  });
  return { templates, issuing };
}
