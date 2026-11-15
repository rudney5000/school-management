import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type {
  CreateCurriculumDto,
  Curriculum,
  CurriculumDetail,
  CurriculumFile,
  CurriculumFileType,
  CurriculumListQuery,
  UpdateCurriculumDto,
} from '@entities/curriculum/model/types';

const path = (id: string) => `/curricula/${encodeURIComponent(id)}`;
const scope = (subSchoolId?: string) => (subSchoolId ? { subSchoolId } : undefined);

export class CurriculumApi extends ApiWrapper {
  constructor() {
    super(baseApi);
  }

  /** What the caller may see: drafts for managers, their classes only for families. */
  list(params: CurriculumListQuery) {
    return this.handleRequest<Curriculum[]>(this._baseApi.get('/curricula', params));
  }

  getById(id: string, subSchoolId?: string) {
    return this.handleRequest<CurriculumDetail>(this._baseApi.get(path(id), scope(subSchoolId)));
  }

  create(payload: CreateCurriculumDto, subSchoolId?: string) {
    return this.handleRequest<CurriculumDetail>(
      this._baseApi.post('/curricula', payload, scope(subSchoolId)),
    );
  }

  update(id: string, payload: UpdateCurriculumDto, subSchoolId?: string) {
    return this.handleRequest<CurriculumDetail>(
      this._baseApi.patch(path(id), payload, scope(subSchoolId)),
    );
  }

  setPublished(id: string, published: boolean, subSchoolId?: string) {
    return this.handleRequest<CurriculumDetail>(
      this._baseApi.post(
        `${path(id)}/${published ? 'publish' : 'unpublish'}`,
        undefined,
        scope(subSchoolId),
      ),
    );
  }

  remove(id: string, subSchoolId?: string) {
    return this.handleRequest<void>(this._baseApi.delete(path(id), scope(subSchoolId)));
  }

  presignFile(
    id: string,
    file: { filename: string; mimeType: CurriculumFileType; size: number },
    subSchoolId?: string,
  ) {
    return this.handleRequest<{ uploadUrl: string; key: string }>(
      this._baseApi.post(`${path(id)}/files/presign`, file, scope(subSchoolId)),
    );
  }

  confirmFile(
    id: string,
    file: { filename: string; mimeType: CurriculumFileType; size: number; key: string },
    subSchoolId?: string,
  ) {
    return this.handleRequest<CurriculumFile>(
      this._baseApi.post(`${path(id)}/files`, file, scope(subSchoolId)),
    );
  }

  removeFile(id: string, fileId: string, subSchoolId?: string) {
    return this.handleRequest<void>(
      this._baseApi.delete(`${path(id)}/files/${encodeURIComponent(fileId)}`, scope(subSchoolId)),
    );
  }

  /** A short-lived link to the file, issued once the backend has checked access. */
  downloadUrl(id: string, fileId: string, subSchoolId?: string) {
    return this.handleRequest<{ url: string; filename: string; expiresIn: number }>(
      this._baseApi.get(
        `${path(id)}/files/${encodeURIComponent(fileId)}/download`,
        scope(subSchoolId),
      ),
    );
  }
}

export const curriculumApi = new CurriculumApi();
