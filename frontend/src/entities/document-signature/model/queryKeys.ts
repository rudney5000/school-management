import type { DocumentType } from '@entities/document-signature/model/types';

export const documentSignatureKeys = {
  all: ['document-signature'] as const,
  status: (type: DocumentType, params: Record<string, string>) =>
    [...documentSignatureKeys.all, 'status', type, params] as const,
};
