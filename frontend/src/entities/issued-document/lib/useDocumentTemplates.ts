import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommonError } from '@shared/helperClass/CommonError';
import { documentTemplateApi } from '@entities/issued-document/api/document-template.api';
import { IssuedDocumentError } from '@entities/issued-document/lib/useIssuedDocuments';
import type {
  DocumentTypeInfo,
  DocumentFolder,
  IssuedDocumentType,
  DocumentTemplate,
  TemplateLibrary,
  TemplateStarter,
  TemplateVersion,
} from '@entities/issued-document/model/types';

/** Error of a template call; `details` holds the layout problems, by path. */
export class TemplateError extends IssuedDocumentError {}

function unwrap<T>(response: { IsSuccess: boolean; result: unknown }): T {
  if (response.IsSuccess) return response.result as T;
  const error = response.result as CommonError;
  const data = error.data as { response?: { data?: { error?: { details?: unknown } } } };
  const details = (data?.response?.data?.error?.details ?? {}) as Record<string, string[]>;
  throw new TemplateError(error.Code, error.Message, details);
}

const keys = {
  all: ['document-template'] as const,
  list: (subSchoolId?: string) => ['document-template', 'list', subSchoolId] as const,
  versions: (id?: string) => ['document-template', 'versions', id] as const,
};

export const useTemplateStarters = () =>
  useQuery<TemplateStarter[], Error>({
    queryKey: ['document-template', 'starters'],
    queryFn: async () => unwrap(await documentTemplateApi.starters()),
    staleTime: Infinity,
  });

export const useDocumentTypeInfo = (type?: IssuedDocumentType) =>
  useQuery<DocumentTypeInfo, Error>({
    queryKey: ['document-template', 'type', type],
    enabled: !!type,
    queryFn: async () => unwrap(await documentTemplateApi.describeType(type!)),
    staleTime: Infinity,
  });

export const useDocumentTemplates = (subSchoolId?: string) =>
  useQuery<DocumentTemplate[], Error>({
    queryKey: keys.list(subSchoolId),
    enabled: !!subSchoolId,
    queryFn: async () => unwrap(await documentTemplateApi.list(subSchoolId!)),
  });

export const useTemplateLibrary = (subSchoolId?: string) =>
  useQuery<TemplateLibrary, Error>({
    queryKey: ['document-template', 'library', subSchoolId],
    enabled: !!subSchoolId,
    queryFn: async () => unwrap(await documentTemplateApi.library(subSchoolId!)),
  });

export const useTemplateVersions = (id?: string) =>
  useQuery<TemplateVersion[], Error>({
    queryKey: keys.versions(id),
    enabled: !!id,
    queryFn: async () => unwrap(await documentTemplateApi.versions(id!)),
  });

/** Every template action refreshes the lists, the versions and the previews. */
export const useTemplateAction = <A>(action: (args: A) => Promise<unknown>) => {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, A>({
    mutationFn: action,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
  });
};

export const templateActions = {
  create: async (args: Parameters<typeof documentTemplateApi.create>) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.create(...args)),
  saveDraft: async ({ id, layout }: { id: string; layout: unknown }) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.saveDraft(id, layout)),
  publish: async ({ id, note }: { id: string; note: string | null }) =>
    unwrap<TemplateVersion>(await documentTemplateApi.publish(id, note)),
  activate: async ({ id, version }: { id: string; version: number }) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.activate(id, version)),
  archive: async ({ id }: { id: string }) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.archive(id)),
  rename: async ({ id, name }: { id: string; name: string }) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.rename(id, name)),
  move: async ({ id, folderId, index }: { id: string; folderId: string | null; index: number }) =>
    unwrap<void>(await documentTemplateApi.move(id, folderId, index)),
  duplicate: async ({ id, name }: { id: string; name: string }) =>
    unwrap<DocumentTemplate>(await documentTemplateApi.duplicate(id, name)),
  remove: async ({ id }: { id: string }) =>
    unwrap<{ result: 'deleted' | 'archived' }>(await documentTemplateApi.remove(id)),
  createFolder: async ({
    subSchoolId,
    name,
    parentId,
  }: {
    subSchoolId: string;
    name: string;
    parentId: string | null;
  }) =>
    unwrap<DocumentFolder>(await documentTemplateApi.createFolder(subSchoolId, { name, parentId })),
  renameFolder: async ({ id, name }: { id: string; name: string }) =>
    unwrap<void>(await documentTemplateApi.renameFolder(id, name)),
  moveFolder: async ({
    id,
    parentId,
    index,
  }: {
    id: string;
    parentId: string | null;
    index: number;
  }) => unwrap<void>(await documentTemplateApi.moveFolder(id, parentId, index)),
  deleteFolder: async ({ id }: { id: string }) =>
    unwrap<void>(await documentTemplateApi.deleteFolder(id)),
};
