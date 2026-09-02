import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { attachmentApi } from '@entities/attachment/api/attachment.api';
import type { ConfirmUploadDto } from '@entities/attachment/model/createAttachmentSchema';
import type { Attachment } from '@entities/attachment';
import type { CommonError } from '@shared/helperClass/CommonError';

export const useConfirmAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: ConfirmUploadDto): Promise<Attachment> => {
      const response = await attachmentApi.confirm(dto);

      if (!response.IsSuccess) {
        const apiError = response.result as CommonError;
        throw new Error(apiError.Message);
      }

      return response.result as Attachment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['attachments'],
      });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
