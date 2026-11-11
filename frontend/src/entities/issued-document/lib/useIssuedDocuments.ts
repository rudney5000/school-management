import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CommonError } from '@shared/helperClass/CommonError';
import { issuedDocumentApi } from '@entities/issued-document/api/issued-document.api';
import type { IssueBulletinDto, IssuedDocument } from '@entities/issued-document/model/types';

export const issuedDocumentKeys = {
  all: ['issued-document'] as const,
  list: (subSchoolId: string | undefined) => ['issued-document', 'list', subSchoolId] as const,
};

/** Thrown by the hooks below, so the page can explain the backend's code. */
export class IssuedDocumentError extends Error {
  constructor(
    readonly code: string,
    message: string,
    /** Problems by path (a field key for INVALID_FIELDS), as the backend sends them. */
    readonly details: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

const fail = (result: unknown): never => {
  const error = result as CommonError;
  const data = error.data as { response?: { data?: { error?: { details?: unknown } } } };
  const details = (data?.response?.data?.error?.details ?? {}) as Record<string, string[]>;
  throw new IssuedDocumentError(error.Code, error.Message, details);
};

export const useIssuedDocuments = (subSchoolId: string | undefined) =>
  useQuery<IssuedDocument[], Error>({
    queryKey: issuedDocumentKeys.list(subSchoolId),
    enabled: !!subSchoolId,
    queryFn: async () => {
      const response = await issuedDocumentApi.list({ subSchoolId: subSchoolId! });
      return response.IsSuccess ? (response.result as IssuedDocument[]) : fail(response.result);
    },
  });

export const useIssueBulletin = () => {
  const queryClient = useQueryClient();
  return useMutation<IssuedDocument, Error, IssueBulletinDto>({
    mutationFn: async (dto) => {
      const response = await issuedDocumentApi.issueBulletin(dto);
      return response.IsSuccess ? (response.result as IssuedDocument) : fail(response.result);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issuedDocumentKeys.all }),
  });
};

/** `details` holds the field problems sent back by the engine, by field key. */
export const useIssueFreeDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IssuedDocument,
    Error,
    { subSchoolId: string; templateId: string; fields: Record<string, string> }
  >({
    mutationFn: async ({ subSchoolId, templateId, fields }) => {
      const response = await issuedDocumentApi.issueFree(subSchoolId, templateId, fields);
      return response.IsSuccess ? (response.result as IssuedDocument) : fail(response.result);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issuedDocumentKeys.all }),
  });
};

export const useRevokeIssuedDocument = () => {
  const queryClient = useQueryClient();
  return useMutation<IssuedDocument, Error, { id: string; reason: string }>({
    mutationFn: async ({ id, reason }) => {
      const response = await issuedDocumentApi.revoke(id, reason);
      return response.IsSuccess ? (response.result as IssuedDocument) : fail(response.result);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: issuedDocumentKeys.all }),
  });
};

/** Saves the stored PDF under its number, e.g. GSJ-BUL-2025-2026-000001.pdf. */
export async function downloadIssuedDocument(doc: Pick<IssuedDocument, 'id' | 'number'>) {
  try {
    const blob = await issuedDocumentApi.downloadPdf(doc.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${doc.number}.pdf`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    throw new IssuedDocumentError(new CommonError(error).Code, new CommonError(error).Message);
  }
}
