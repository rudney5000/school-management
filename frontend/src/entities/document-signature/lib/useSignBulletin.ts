import { useMutation, useQueryClient } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api';
import type { BulletinSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema';

export const useSignBulletin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BulletinSignDto) => documentSignatureApi.signBulletin(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-signature', 'bulletin', 'status'] });
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
