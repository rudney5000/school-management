import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { handleApiError } from '@shared/lib';
import type { CommonError } from '@shared/helperClass/CommonError';
import { type SignatureStatusResult, documentSignatureApi } from '@entities/document-signature';
import type { CertificateSignDto } from '@entities/document-signature/model/createDocumentSignatureSchema';

export const useCertificateSignatureStatus = (params: CertificateSignDto | undefined) => {
  const query = useQuery<SignatureStatusResult, Error>({
    queryKey: ['document-signature', 'certificate', 'status', params],
    enabled: !!params?.subSchoolId && !!params?.certificateId && !!params?.studentId,
    queryFn: async (): Promise<SignatureStatusResult> => {
      if (!params) return { isSigned: false };

      const response = await documentSignatureApi.getCertificateStatus(params);

      if (!response.IsSuccess) {
        const apiError = response.result as CommonError;
        throw new Error(apiError.Message);
      }

      return response.result as SignatureStatusResult;
    },
  });

  useEffect(() => {
    if (query.isError && query.error && !query.data) {
      handleApiError(query.error);
    }
  }, [query.isError, query.error, query.data]);

  return query;
};
