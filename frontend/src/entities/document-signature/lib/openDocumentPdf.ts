import {
  type DocumentPdfParamsMap,
  type DocumentType,
  fetchPdf,
} from '@entities/document-signature';

export async function openDocumentPdf<T extends DocumentType>(
  documentType: T,
  params: DocumentPdfParamsMap[T],
): Promise<void> {
  const blob = await fetchPdf(documentType, params);
  const url = URL.createObjectURL(blob);

  window.open(url, '_blank');

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
