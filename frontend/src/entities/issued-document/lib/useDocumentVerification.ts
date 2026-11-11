import { useQuery } from '@tanstack/react-query';
import type { CommonError } from '@shared/helperClass/CommonError';
import { issuedDocumentApi } from '@entities/issued-document/api/issued-document.api';
import type { DocumentVerification } from '@entities/issued-document/model/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * `data` is null when no document has this id: a forged or mistyped QR code
 * is an answer, not an error. Only a network or server failure is an error.
 */
export const useDocumentVerification = (id: string) =>
  useQuery<DocumentVerification | null, Error>({
    queryKey: ['issued-document', 'verify', id],
    retry: 1,
    queryFn: async () => {
      if (!UUID.test(id)) return null;
      const response = await issuedDocumentApi.verify(id);
      if (response.IsSuccess) return response.result as DocumentVerification;

      const error = response.result as CommonError;
      if (error.StatusCode === 404 || error.StatusCode === 400) return null;
      throw new Error(error.Message);
    },
  });
