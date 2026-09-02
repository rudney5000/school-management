import { useQueries } from '@tanstack/react-query';
import { useEffect } from 'react';
import { handleApiError } from '@shared/lib';
import type { CommonError } from '@shared/helperClass/CommonError';
import { documentSignatureApi } from '@entities/document-signature/api/document-signature.api';
import type { BulletinSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema';
import type { SignatureStatusResult } from '@entities/document-signature/model/types';

export function useBulletinSignatureStatuses(paramsList: BulletinSignDto[]) {
  const results = useQueries({
    queries: paramsList.map((params) => ({
      queryKey: ['document-signature', 'bulletin', 'status', params],
      queryFn: async (): Promise<SignatureStatusResult> => {
        const response = await documentSignatureApi.getBulletinStatus(params);

        if (!response.IsSuccess) {
          const apiError = response.result as CommonError;
          throw new Error(apiError.Message);
        }

        return response.result as SignatureStatusResult;
      },
      staleTime: 30_000,
    })),
  });

  const firstError = results.find((r) => r.isError && r.error && !r.data);

  useEffect(() => {
    if (firstError?.error) {
      handleApiError(firstError.error);
    }
  }, [firstError?.error]);

  const statusByStudentId = new Map<string, SignatureStatusResult | undefined>(
    paramsList.map((params, i) => [params.studentId, results[i]?.data]),
  );

  return {
    statusByStudentId,
    isLoading: results.some((r) => r.isLoading),
  };
}
