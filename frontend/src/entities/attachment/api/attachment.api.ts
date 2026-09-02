import { ApiWrapper } from '@shared/api/ApiWrapper';
import { baseApi } from '@shared/api/instance';
import type { Attachment } from '@entities/attachment/model/types';
import type {
  AttachmentParamsDto,
  ListAttachmentsQueryDto,
  PresignUploadResultDto,
} from '@entities/attachment/model/dto';
import type {
  ConfirmUploadDto,
  PresignUploadDto,
  RejectAttachmentDto,
} from '@entities/attachment/model/createAttachmentSchema';

export class AttachmentApi extends ApiWrapper {
  constructor() {
    super(baseApi);
  }

  presign(payload: PresignUploadDto) {
    return this.handleRequest<PresignUploadResultDto>(
      this._baseApi.post('/attachments/presign', payload),
      (raw) => raw as PresignUploadResultDto,
    );
  }

  confirm(payload: ConfirmUploadDto) {
    return this.handleRequest<Attachment>(
      this._baseApi.post('/attachments/confirm', payload),
      (raw) => raw as Attachment,
    );
  }

  list(params: ListAttachmentsQueryDto) {
    return this.handleRequest<Attachment[]>(
      this._baseApi.get('/attachments', params),
      (raw) => raw as Attachment[],
    );
  }

  validate(params: AttachmentParamsDto) {
    return this.handleRequest<Attachment>(
      this._baseApi.patch(`/attachments/${params.id}/validate`),
      (raw) => raw as Attachment,
    );
  }

  reject(params: AttachmentParamsDto, payload: RejectAttachmentDto) {
    return this.handleRequest<Attachment>(
      this._baseApi.patch(`/attachments/${params.id}/reject`, payload),
      (raw) => raw as Attachment,
    );
  }

  remove(params: AttachmentParamsDto) {
    return this.handleRequest<{ id: string }>(
      this._baseApi.delete(`/attachments/${params.id}`),
      (raw) => raw as { id: string },
    );
  }
}

export const attachmentApi = new AttachmentApi();
