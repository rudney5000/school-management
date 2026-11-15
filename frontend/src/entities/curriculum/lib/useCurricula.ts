import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CommonError } from '@shared/helperClass/CommonError';
import { curriculumApi } from '@entities/curriculum/api/curriculum.api';
import {
  CURRICULUM_FILE_TYPES,
  CURRICULUM_MAX_FILE_SIZE,
  type CreateCurriculumDto,
  type Curriculum,
  type CurriculumDetail,
  type CurriculumFile,
  type CurriculumFileType,
  type CurriculumListQuery,
  type UpdateCurriculumDto,
} from '@entities/curriculum/model/types';

export const curriculumKeys = {
  all: ['curriculum'] as const,
  list: (query: CurriculumListQuery) => ['curriculum', 'list', query] as const,
  detail: (id: string | undefined) => ['curriculum', 'detail', id] as const,
};

/** Thrown by the hooks below, with the backend's error code so the page can explain it. */
export class CurriculumError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const fail = (result: unknown): never => {
  const error = result as CommonError;
  throw new CurriculumError(error.Code, error.Message);
};

async function unwrap<T>(request: Promise<{ IsSuccess: boolean; result: unknown }>): Promise<T> {
  const response = await request;
  return response.IsSuccess ? (response.result as T) : fail(response.result);
}

export const useCurricula = (query: CurriculumListQuery, enabled = true) =>
  useQuery<Curriculum[], Error>({
    queryKey: curriculumKeys.list(query),
    enabled,
    queryFn: () => unwrap<Curriculum[]>(curriculumApi.list(query)),
  });

export const useCurriculum = (id: string | undefined, subSchoolId?: string) =>
  useQuery<CurriculumDetail, Error>({
    queryKey: curriculumKeys.detail(id),
    enabled: !!id,
    queryFn: () => unwrap<CurriculumDetail>(curriculumApi.getById(id!, subSchoolId)),
  });

/** Every write changes both the lists and the detail, so they all refresh together. */
function useCurriculumMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation<TResult, Error, TVariables>({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: curriculumKeys.all }),
  });
}

export const useCreateCurriculum = (subSchoolId?: string) =>
  useCurriculumMutation((dto: CreateCurriculumDto) =>
    unwrap<CurriculumDetail>(curriculumApi.create(dto, subSchoolId)),
  );

export const useUpdateCurriculum = (subSchoolId?: string) =>
  useCurriculumMutation(({ id, dto }: { id: string; dto: UpdateCurriculumDto }) =>
    unwrap<CurriculumDetail>(curriculumApi.update(id, dto, subSchoolId)),
  );

export const usePublishCurriculum = (subSchoolId?: string) =>
  useCurriculumMutation(({ id, published }: { id: string; published: boolean }) =>
    unwrap<CurriculumDetail>(curriculumApi.setPublished(id, published, subSchoolId)),
  );

export const useDeleteCurriculum = (subSchoolId?: string) =>
  useCurriculumMutation((id: string) => unwrap<void>(curriculumApi.remove(id, subSchoolId)));

export const useDeleteCurriculumFile = (subSchoolId?: string) =>
  useCurriculumMutation(({ id, fileId }: { id: string; fileId: string }) =>
    unwrap<void>(curriculumApi.removeFile(id, fileId, subSchoolId)),
  );

export function isAcceptedCurriculumFile(file: File): file is File & { type: CurriculumFileType } {
  return (
    (CURRICULUM_FILE_TYPES as readonly string[]).includes(file.type) &&
    file.size > 0 &&
    file.size <= CURRICULUM_MAX_FILE_SIZE
  );
}

/** Presign, send the file straight to storage, then record it on the programme. */
export const useUploadCurriculumFile = (subSchoolId?: string) =>
  useCurriculumMutation(async ({ id, file }: { id: string; file: File }) => {
    if (!isAcceptedCurriculumFile(file)) {
      throw new CurriculumError('UNSUPPORTED_FILE', file.name);
    }

    const meta = { filename: file.name, mimeType: file.type, size: file.size };
    const { uploadUrl, key } = await unwrap<{ uploadUrl: string; key: string }>(
      curriculumApi.presignFile(id, meta, subSchoolId),
    );

    const upload = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!upload.ok) throw new CurriculumError('UPLOAD_FAILED', file.name);

    return unwrap<CurriculumFile>(curriculumApi.confirmFile(id, { ...meta, key }, subSchoolId));
  });

/** Opens the file through a short-lived link, which names the download after the file. */
export async function downloadCurriculumFile(
  curriculumId: string,
  fileId: string,
  subSchoolId?: string,
): Promise<void> {
  const { url } = await unwrap<{ url: string }>(
    curriculumApi.downloadUrl(curriculumId, fileId, subSchoolId),
  );
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}
