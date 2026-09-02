import { useMutation } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { attachmentApi } from '@entities/attachment/api/attachment.api';
import type { PresignUploadDto } from '@entities/attachment/model/createAttachmentSchema';
import type { PresignUploadResultDto } from '@entities/attachment';
import type { CommonError } from '@shared/helperClass/CommonError';

export const usePresignAttachment = () => {
  return useMutation({
    mutationFn: async (dto: PresignUploadDto): Promise<PresignUploadResultDto> => {
      const response = await attachmentApi.presign(dto);

      if (!response.IsSuccess) {
        const apiError = response.result as CommonError;
        throw new Error(apiError.Message);
      }

      return response.result as PresignUploadResultDto;
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
