import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
  DocumentTypeInfo,
  DocumentFolder,
  DocumentTemplate,
  TemplateLibrary,
  IssuedDocumentType,
  TemplateStarter,
  TemplateVersion,
} from '@entities/issued-document/model/types';

const path = (id: string, rest = '') => `/documents/templates/${encodeURIComponent(id)}${rest}`;

export class DocumentTemplateApi extends ApiWrapper {
  constructor() {
    super(baseApi);
  }

  /** What a template of this type may contain: variables, blocks, and sample data for previews. */
  describeType(type: IssuedDocumentType) {
    return this.handleRequest<DocumentTypeInfo>(
      this._baseApi.get(`/documents/types/${encodeURIComponent(type)}`),
    );
  }

  starters() {
    return this.handleRequest<TemplateStarter[]>(this._baseApi.get('/documents/starters'));
  }

  /** `subSchoolId` names the group through one of its sub-schools. */
  list(subSchoolId: string) {
    return this.handleRequest<DocumentTemplate[]>(
      this._baseApi.get('/documents/templates', { subSchoolId }),
    );
  }

  create(
    contextSubSchoolId: string,
    body: {
      documentType: IssuedDocumentType;
      name: string;
      subSchoolId: string | null;
      folderId?: string | null;
    } & ({ starter: string } | { layout: Record<string, unknown> }),
  ) {
    return this.handleRequest<DocumentTemplate>(
      this._baseApi.post('/documents/templates', body, { subSchoolId: contextSubSchoolId }),
    );
  }

  library(subSchoolId: string) {
    return this.handleRequest<TemplateLibrary>(
      this._baseApi.get('/documents/templates/library', { subSchoolId }),
    );
  }

  createFolder(subSchoolId: string, body: { name: string; parentId: string | null }) {
    return this.handleRequest<DocumentFolder>(
      this._baseApi.post('/documents/folders', body, { subSchoolId }),
    );
  }

  renameFolder(id: string, name: string) {
    return this.handleRequest<void>(
      this._baseApi.patch(`/documents/folders/${encodeURIComponent(id)}`, { name }),
    );
  }

  moveFolder(id: string, parentId: string | null, index: number) {
    return this.handleRequest<void>(
      this._baseApi.post(`/documents/folders/${encodeURIComponent(id)}/move`, { parentId, index }),
    );
  }

  deleteFolder(id: string) {
    return this.handleRequest<void>(
      this._baseApi.delete(`/documents/folders/${encodeURIComponent(id)}`),
    );
  }

  rename(id: string, name: string) {
    return this.handleRequest<DocumentTemplate>(this._baseApi.patch(path(id), { name }));
  }

  move(id: string, folderId: string | null, index: number) {
    return this.handleRequest<void>(this._baseApi.post(path(id, '/move'), { folderId, index }));
  }

  duplicate(id: string, name: string) {
    return this.handleRequest<DocumentTemplate>(
      this._baseApi.post(path(id, '/duplicate'), { name }),
    );
  }

  remove(id: string) {
    return this.handleRequest<{ result: 'deleted' | 'archived' }>(this._baseApi.delete(path(id)));
  }

  versions(id: string) {
    return this.handleRequest<TemplateVersion[]>(this._baseApi.get(path(id, '/versions')));
  }

  saveDraft(id: string, layout: unknown) {
    return this.handleRequest<DocumentTemplate>(this._baseApi.put(path(id, '/draft'), { layout }));
  }

  publish(id: string, note: string | null) {
    return this.handleRequest<TemplateVersion>(this._baseApi.post(path(id, '/publish'), { note }));
  }

  activate(id: string, version: number) {
    return this.handleRequest<DocumentTemplate>(
      this._baseApi.post(path(id, '/activate'), { version }),
    );
  }

  archive(id: string) {
    return this.handleRequest<DocumentTemplate>(this._baseApi.post(path(id, '/archive')));
  }

  /**
   * The draft, a published version, or a layout being edited and not saved
   * yet, rendered with sample data under "BROUILLON".
   */
  async preview(id: string, version?: number, layout?: unknown): Promise<Blob> {
    const response = await this._baseApi.axiosInstance.post(
      path(id, '/preview'),
      {
        ...(version === undefined ? {} : { version }),
        ...(layout === undefined ? {} : { layout }),
      },
      { responseType: 'blob' },
    );
    return response.data as Blob;
  }
}

export const documentTemplateApi = new DocumentTemplateApi();
