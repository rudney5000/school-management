import type { AttachableType } from '@entities/attachment/model/types';

export type AttachmentParamsDto = {
  id: string;
};

export type ListAttachmentsQueryDto = {
  attachableType: AttachableType;
  attachableId: string;
};

export type PresignUploadResultDto = {
  uploadUrl: string;
  key: string;
};
