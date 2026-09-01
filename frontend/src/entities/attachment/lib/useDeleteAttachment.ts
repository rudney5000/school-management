import { useMutation, useQueryClient } from '@tanstack/react-query';
import { attachmentApi } from '@entities/attachment/api/attachment.api';
import { handleApiError } from '@shared/lib';
import { isSuccess } from '@shared/helperClass/CommonResponse';

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await attachmentApi.remove({ id });

      if (!isSuccess(response)) {
        throw new Error('Échec de la suppression du document');
      }

      return response.result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments'] });
    },
    onError: (err) => handleApiError(err as Error),
  });
};
