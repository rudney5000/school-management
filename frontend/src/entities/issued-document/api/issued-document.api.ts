import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
  DocumentVerification,
  IssueBulletinDto,
  IssuedDocument,
  IssuedDocumentType,
} from '@entities/issued-document/model/types';

export class IssuedDocumentApi extends ApiWrapper {
  constructor() {
    super(baseApi);
  }

  list(params: { subSchoolId: string; documentType?: IssuedDocumentType; subjectId?: string }) {
    return this.handleRequest<IssuedDocument[]>(this._baseApi.get('/documents/issued', params));
  }

  issueBulletin({ subSchoolId, replaces, ...params }: IssueBulletinDto) {
    return this.handleRequest<IssuedDocument>(
      this._baseApi.post('/documents/issued', {
        type: 'bulletin',
        subSchoolId,
        params,
        ...(replaces ? { replaces } : {}),
      }),
    );
  }

  /** A free document: the chosen template and the values typed in its fields. */
  issueFree(subSchoolId: string, templateId: string, fields: Record<string, string>) {
    return this.handleRequest<IssuedDocument>(
      this._baseApi.post('/documents/issued', { type: 'free', subSchoolId, templateId, fields }),
    );
  }

  /** The stored PDF, byte for byte. */
  async downloadPdf(id: string): Promise<Blob> {
    const response = await this._baseApi.axiosInstance.get(
      `/documents/issued/${encodeURIComponent(id)}/pdf`,
      { responseType: 'blob' },
    );
    return response.data as Blob;
  }

  revoke(id: string, reason: string) {
    return this.handleRequest<IssuedDocument>(
      this._baseApi.post(`/documents/issued/${encodeURIComponent(id)}/revoke`, { reason }),
    );
  }

  /** Public: no token needed. */
  verify(id: string) {
    return this.handleRequest<DocumentVerification>(
      this._baseApi.get(`/documents/verify/${encodeURIComponent(id)}`),
    );
  }
}

export const issuedDocumentApi = new IssuedDocumentApi();
