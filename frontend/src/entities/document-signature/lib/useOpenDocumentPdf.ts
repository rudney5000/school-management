import { useMutation } from '@tanstack/react-query';
import { type DocumentPdfParamsMap, openDocumentPdf } from '@entities/document-signature';
import { handleApiError } from '@shared/lib';

type OpenPdfInput = {
  [K in keyof DocumentPdfParamsMap]: {
    documentType: K;
    params: DocumentPdfParamsMap[K];
  };
}[keyof DocumentPdfParamsMap];

export const useOpenDocumentPdf = () => {
  return useMutation({
    mutationFn: (input: OpenPdfInput) => {
      return openDocumentPdf(input.documentType, input.params);
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
