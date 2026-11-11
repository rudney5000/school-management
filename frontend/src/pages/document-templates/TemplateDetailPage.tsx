import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Archive, ArrowLeft, Loader2, Save, Upload } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { useAppSelector } from '@shared/store/hooks';
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@/shared/ui';
import { selectRole } from '@features/auth/model/selectors';
import {
  documentTemplateApi,
  TemplateError,
  templateActions,
  useDocumentTemplates,
  useTemplateAction,
  useTemplateVersions,
  type DocumentTemplate,
} from '@entities/issued-document';

const MANAGERS = ['director', 'super_admin'];

/** The PDF of the draft (or of a version), kept as an object URL while shown. */
function usePreviewUrl(template: DocumentTemplate | undefined, version: number | undefined) {
  const query = useQuery<string, Error>({
    queryKey: ['document-template', 'preview', template?.id, version, template?.updatedAt],
    enabled: !!template && (version !== undefined || !!template.draftLayout),
    queryFn: async () =>
      URL.createObjectURL(await documentTemplateApi.preview(template!.id, version)),
    gcTime: 0,
  });
  useEffect(() => {
    const url = query.data;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [query.data]);
  return query;
}

function formatDate(iso: string, locale: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function TemplateDetailPage() {
  const {
    subSchoolId,
    templateId,
    locale: routeLocale = 'fr',
  } = useParams({ strict: false }) as {
    subSchoolId?: string;
    templateId?: string;
    locale?: string;
  };
  const { t, locale } = useTranslation();
  const role = useAppSelector(selectRole);
  const canManage = !!role && MANAGERS.includes(role);

  const {
    data: templates = [],
    isLoading,
    isError: listFailed,
    error: listError,
  } = useDocumentTemplates(subSchoolId);

  const live = templates.filter((tpl) => !tpl.archivedAt);
  const selected = templates.find((tpl) => tpl.id === templateId);

  const [previewVersion, setPreviewVersion] = useState<number>();
  const preview = usePreviewUrl(selected, previewVersion);
  const { data: versions = [] } = useTemplateVersions(selected?.id);

  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState('');
  const [draftText, setDraftText] = useState('');
  const [issues, setIssues] = useState<string[]>([]);

  const saveDraft = useTemplateAction(templateActions.saveDraft);
  const publish = useTemplateAction(templateActions.publish);
  const activate = useTemplateAction(templateActions.activate);
  const archive = useTemplateAction(templateActions.archive);

  useEffect(() => {
    setPreviewVersion(undefined);
    setIssues([]);
    setDraftText(selected?.draftLayout ? JSON.stringify(selected.draftLayout, null, 2) : '');
  }, [selected?.id, selected?.updatedAt, selected?.draftLayout]);

  const fail = (error: unknown) => {
    if (error instanceof TemplateError) {
      const lines = Object.entries(error.details).flatMap(([path, messages]) =>
        messages.map((m) => `${path} — ${m}`),
      );
      setIssues(lines);
      toast.error(
        ['NO_TEMPLATE', 'CONFLICT', 'NOT_FOUND', 'FORBIDDEN', 'NOT_CONFIGURED'].includes(error.code)
          ? t(`templatesPage.errors.${error.code}`)
          : lines.length
            ? t('templatesPage.errors.invalid', { count: lines.length })
            : error.message,
      );
      return;
    }
    toast.error(error instanceof Error ? error.message : t('templatesPage.errors.unknown'));
  };

  const scopeLabel = (tpl: DocumentTemplate) =>
    tpl.subSchoolId === null
      ? t('templatesPage.scope.group')
      : tpl.subSchoolId === subSchoolId
        ? t('templatesPage.scope.thisSubSchool')
        : t('templatesPage.scope.otherSubSchool');

  /** For a bulletin, the template this sub-school issues with: its own, else the group's. */
  const inUseId = useMemo(() => {
    const usable = live.filter(
      (tpl) => tpl.activeVersion !== null && tpl.documentType === 'bulletin',
    );
    return (
      usable.find((tpl) => tpl.subSchoolId === subSchoolId)?.id ??
      usable.find((tpl) => tpl.subSchoolId === null)?.id
    );
  }, [live, subSchoolId]);

  const handleSaveDraft = () => {
    if (!selected) return;
    let layout: unknown;
    try {
      layout = JSON.parse(draftText);
    } catch (error) {
      setIssues([`JSON — ${(error as Error).message}`]);
      toast.error(t('templatesPage.errors.json'));
      return;
    }
    saveDraft.mutate(
      { id: selected.id, layout },
      {
        onSuccess: () => {
          setIssues([]);
          setPreviewVersion(undefined);
          toast.success(t('templatesPage.draft.saved'));
        },
        onError: fail,
      },
    );
  };

  const handlePublish = () => {
    if (!selected) return;
    publish.mutate(
      { id: selected.id, note: note.trim() || null },
      {
        onSuccess: () => {
          toast.success(t('templatesPage.publish.done'));
          setPublishing(false);
          setNote('');
        },
        onError: (error) => {
          setPublishing(false);
          fail(error);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Button size="sm" variant="ghost" asChild>
            <Link
              to="/$locale/sub-schools/$subSchoolId/documents/templates"
              params={{ locale: routeLocale, subSchoolId: subSchoolId ?? '' }}
            >
              <ArrowLeft className="mr-1.5 size-4" />
              {t('templatesPage.title')}
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {isLoading && (
          <div className="py-10 text-center">
            <Spinner />
          </div>
        )}
        {listFailed && (
          <p className="py-10 text-center text-sm text-destructive">
            {t('documentsPage.loadFailed')}
            {listError?.message ? ` (${listError.message})` : ''}
          </p>
        )}
        {!isLoading && !listFailed && !selected && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('templatesPage.errors.NOT_FOUND')}
          </p>
        )}

        {selected && (
          <section className="min-w-0 space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{selected.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {scopeLabel(selected)}
                  {selected.id === inUseId && ` · ${t('templatesPage.inUse')}`}
                </p>
              </div>
              {canManage && !selected.archivedAt && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setPublishing(true)}
                    disabled={publish.isPending}
                  >
                    <Upload className="mr-1.5 size-4" />
                    {t('templatesPage.publish.button')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      archive.mutate(
                        { id: selected.id },
                        {
                          onSuccess: () => toast.success(t('templatesPage.archiveDone')),
                          onError: fail,
                        },
                      )
                    }
                    disabled={archive.isPending}
                  >
                    <Archive className="mr-1.5 size-4" />
                    {t('templatesPage.archive')}
                  </Button>
                </div>
              )}
            </div>

            <Tabs defaultValue="preview" className="flex flex-col">
              <TabsList>
                <TabsTrigger value="preview">{t('templatesPage.tabs.preview')}</TabsTrigger>
                <TabsTrigger value="versions">{t('templatesPage.tabs.versions')}</TabsTrigger>
                {canManage && (
                  <TabsTrigger value="draft">{t('templatesPage.tabs.draft')}</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="preview" className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{t('templatesPage.previewOf')}</span>
                  <Select
                    value={previewVersion === undefined ? 'draft' : String(previewVersion)}
                    onValueChange={(v) => setPreviewVersion(v === 'draft' ? undefined : Number(v))}
                  >
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">{t('templatesPage.draftLabel')}</SelectItem>
                      {versions.map((v) => (
                        <SelectItem key={v.version} value={String(v.version)}>
                          {t('templatesPage.version', { version: v.version })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">
                    {t('templatesPage.sampleNote')}
                  </span>
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted">
                  {preview.isFetching ? (
                    <div className="flex h-[70vh] items-center justify-center text-muted-foreground">
                      <Loader2 className="size-6 animate-spin" />
                    </div>
                  ) : preview.data ? (
                    <iframe
                      title={t('templatesPage.tabs.preview')}
                      src={preview.data}
                      className="h-[70vh] w-full"
                    />
                  ) : (
                    <p className="p-10 text-center text-sm text-muted-foreground">
                      {preview.isError
                        ? t('templatesPage.errors.preview')
                        : t('templatesPage.noDraft')}
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="versions">
                {versions.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    {t('templatesPage.noVersions')}
                  </p>
                ) : (
                  <ul className="divide-y">
                    {[...versions].reverse().map((v) => (
                      <li key={v.version} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">
                            {t('templatesPage.version', { version: v.version })}
                            {selected.activeVersion === v.version && (
                              <Badge className="ml-2" variant="secondary">
                                {t('templatesPage.active')}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(v.publishedAt, locale)}
                            {v.note && ` · ${v.note}`}
                          </div>
                        </div>
                        {canManage &&
                          !selected.archivedAt &&
                          selected.activeVersion !== v.version && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={activate.isPending}
                              onClick={() =>
                                activate.mutate(
                                  { id: selected.id, version: v.version },
                                  {
                                    onSuccess: () =>
                                      toast.success(
                                        t('templatesPage.activated', { version: v.version }),
                                      ),
                                    onError: fail,
                                  },
                                )
                              }
                            >
                              {t('templatesPage.activate')}
                            </Button>
                          )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              {canManage && (
                <TabsContent value="draft" className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t('templatesPage.draft.help')}</p>
                  <Textarea
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    spellCheck={false}
                    className="h-[55vh] font-mono text-xs"
                    disabled={!!selected.archivedAt}
                  />
                  {issues.length > 0 && (
                    <ul className="space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-900 dark:bg-red-950/50 dark:text-red-100">
                      {issues.map((issue) => (
                        <li key={issue} className="font-mono">
                          {issue}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    onClick={handleSaveDraft}
                    disabled={saveDraft.isPending || !!selected.archivedAt}
                  >
                    <Save className="mr-1.5 size-4" />
                    {t('templatesPage.draft.save')}
                  </Button>
                </TabsContent>
              )}
            </Tabs>
          </section>
        )}
      </main>

      <Dialog open={publishing} onOpenChange={setPublishing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templatesPage.publish.title')}</DialogTitle>
            <DialogDescription>{t('templatesPage.publish.text')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-note">{t('templatesPage.publish.note')}</Label>
            <Input id="tpl-note" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishing(false)}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button onClick={handlePublish} disabled={publish.isPending}>
              {t('templatesPage.publish.button')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
