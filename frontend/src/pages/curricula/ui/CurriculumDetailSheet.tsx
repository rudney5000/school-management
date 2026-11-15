import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Eye, EyeOff, FileText, Loader2, Pencil, Trash2, Upload } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import {
  Badge,
  Button,
  DeleteAlert,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  Spinner,
} from '@/shared/ui';
import {
  CURRICULUM_FILE_TYPES,
  CurriculumError,
  downloadCurriculumFile,
  useCurriculum,
  useDeleteCurriculum,
  useDeleteCurriculumFile,
  usePublishCurriculum,
  useUploadCurriculumFile,
  type CurriculumDetail,
} from '@entities/curriculum';
import { CurriculumBadges } from './CurriculumBadges';

type Props = {
  curriculumId: string | null;
  onClose: () => void;
  subSchoolId?: string;
  canManage: boolean;
  onEdit: (curriculum: CurriculumDetail) => void;
};

function formatSize(bytes: number, t: (key: string, values?: Record<string, unknown>) => string) {
  return bytes < 1024 * 1024
    ? t('curriculaPage.files.kb', { value: Math.max(1, Math.round(bytes / 1024)) })
    : t('curriculaPage.files.mb', { value: (bytes / (1024 * 1024)).toFixed(1) });
}

export function CurriculumDetailSheet({
  curriculumId,
  onClose,
  subSchoolId,
  canManage,
  onEdit,
}: Props) {
  const { t } = useTranslation();
  const { data: curriculum, isLoading } = useCurriculum(curriculumId ?? undefined, subSchoolId);
  const publish = usePublishCurriculum(subSchoolId);
  const remove = useDeleteCurriculum(subSchoolId);
  const upload = useUploadCurriculumFile(subSchoolId);
  const removeFile = useDeleteCurriculumFile(subSchoolId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const explain = (error: unknown) => {
    const code = error instanceof CurriculumError ? error.code : '';
    const known = ['UNSUPPORTED_FILE', 'UPLOAD_FAILED', 'CONFLICT', 'NOT_FOUND', 'FORBIDDEN'];
    toast.error(
      known.includes(code)
        ? t(`curriculaPage.errors.${code}`)
        : error instanceof Error
          ? error.message
          : t('curriculaPage.errors.unknown'),
    );
  };

  const handleFiles = async (files: FileList | null) => {
    if (!curriculum || !files) return;
    for (const file of Array.from(files)) {
      try {
        await upload.mutateAsync({ id: curriculum.id, file });
        toast.success(t('curriculaPage.files.uploaded', { name: file.name }));
      } catch (error) {
        explain(error);
      }
    }
    if (fileInput.current) fileInput.current.value = '';
  };

  const handleDownload = async (fileId: string) => {
    if (!curriculum) return;
    setDownloading(fileId);
    try {
      await downloadCurriculumFile(curriculum.id, fileId, subSchoolId);
    } catch (error) {
      explain(error);
    } finally {
      setDownloading(null);
    }
  };

  const published = curriculum?.status === 'published';

  return (
    <Sheet open={!!curriculumId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {isLoading || !curriculum ? (
          <div className="py-16 text-center">
            <SheetTitle className="sr-only">{t('curriculaPage.title')}</SheetTitle>
            <Spinner />
          </div>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>{curriculum.title}</SheetTitle>
              <SheetDescription>
                {curriculum.schoolYear}
                {curriculum.course ? ` · ${curriculum.course.name}` : ''}
              </SheetDescription>
              <CurriculumBadges curriculum={curriculum} showStatus={canManage} />
            </SheetHeader>

            <div className="space-y-6 px-4 pb-6">
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">{t('curriculaPage.detail.classes')}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {curriculum.classes.map((klass) => (
                    <Badge key={klass.id} variant="outline">
                      {klass.name}
                    </Badge>
                  ))}
                </div>
              </section>

              {curriculum.description && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">{t('curriculaPage.detail.description')}</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {curriculum.description}
                  </p>
                </section>
              )}

              <section className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{t('curriculaPage.files.title')}</h3>
                  {canManage && (
                    <>
                      <input
                        ref={fileInput}
                        type="file"
                        multiple
                        className="hidden"
                        accept={CURRICULUM_FILE_TYPES.join(',')}
                        onChange={(e) => void handleFiles(e.target.files)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInput.current?.click()}
                        disabled={upload.isPending}
                      >
                        {upload.isPending ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 size-4" />
                        )}
                        {t('curriculaPage.files.add')}
                      </Button>
                    </>
                  )}
                </div>
                {canManage && (
                  <p className="text-xs text-muted-foreground">{t('curriculaPage.files.hint')}</p>
                )}
                {curriculum.files.length === 0 ? (
                  <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    {t('curriculaPage.files.empty')}
                  </p>
                ) : (
                  <ul className="divide-y rounded-lg border">
                    {curriculum.files.map((file) => (
                      <li key={file.id} className="flex items-center gap-3 px-3 py-2">
                        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(file.size, t)}
                          </p>
                        </div>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => handleDownload(file.id)}
                          disabled={downloading === file.id}
                          title={t('curriculaPage.files.download')}
                        >
                          {downloading === file.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4" />
                          )}
                        </Button>
                        {canManage && (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              removeFile.mutate(
                                { id: curriculum.id, fileId: file.id },
                                { onError: explain },
                              )
                            }
                            disabled={removeFile.isPending}
                            title={t('curriculaPage.files.remove')}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              {canManage && (
                <section className="flex flex-wrap gap-2 border-t pt-4">
                  <Button
                    onClick={() =>
                      publish.mutate(
                        { id: curriculum.id, published: !published },
                        {
                          onSuccess: () =>
                            toast.success(
                              t(
                                published
                                  ? 'curriculaPage.actions.unpublished'
                                  : 'curriculaPage.actions.published',
                              ),
                            ),
                          onError: explain,
                        },
                      )
                    }
                    variant={published ? 'outline' : 'default'}
                    disabled={publish.isPending}
                  >
                    {published ? (
                      <EyeOff className="mr-2 size-4" />
                    ) : (
                      <Eye className="mr-2 size-4" />
                    )}
                    {t(
                      published
                        ? 'curriculaPage.actions.unpublish'
                        : 'curriculaPage.actions.publish',
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => onEdit(curriculum)}>
                    <Pencil className="mr-2 size-4" />
                    {t('curriculaPage.actions.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    {t('curriculaPage.actions.delete')}
                  </Button>
                </section>
              )}
            </div>
          </>
        )}
      </SheetContent>

      <DeleteAlert
        isOpen={confirmDelete}
        onOpenChange={setConfirmDelete}
        isLoading={remove.isPending}
        onClick={() =>
          curriculum &&
          remove.mutate(curriculum.id, {
            onSuccess: () => {
              toast.success(t('curriculaPage.actions.deleted'));
              setConfirmDelete(false);
              onClose();
            },
            onError: explain,
          })
        }
      />
    </Sheet>
  );
}
