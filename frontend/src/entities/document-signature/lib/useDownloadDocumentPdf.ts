import { useMutation } from '@tanstack/react-query';
import { handleApiError } from '@shared/lib';
import { downloadDocumentPdf } from '@entities/document-signature/lib/downloadDocumentPdf';
import type { DocumentPdfParamsMap } from '@entities/document-signature/model/types';

type DownloadPdfInput = {
  [K in keyof DocumentPdfParamsMap]: {
    documentType: K;
    params: DocumentPdfParamsMap[K];
    filename?: string;
  };
}[keyof DocumentPdfParamsMap];

export const useDownloadDocumentPdf = () => {
  return useMutation({
    mutationFn: (input: DownloadPdfInput) => {
      return downloadDocumentPdf(input.documentType, input.params, input.filename);
    },
    onError: (error: Error) => {
      handleApiError(error);
    },
  });
};
