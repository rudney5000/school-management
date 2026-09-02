import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api';
import type { BatchSignBulletinDto } from '@entities/document-signature/model/createDocumentSignatureSchema';

export const useSignBulletinBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BatchSignBulletinDto) => documentSignatureApi.signBulletinBatch(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-signature', 'bulletin', 'status'] });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
