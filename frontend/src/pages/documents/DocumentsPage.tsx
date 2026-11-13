import { useMemo, useState } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Ban, Download, ExternalLink, FilePlus2, FileText, Loader2 } from 'lucide-react';
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/shared/ui';
import { selectRole } from '@features/auth/model/selectors';
import { useClasses } from '@entities/class';
import { useAcademicPeriods } from '@entities/academic-period';
import { useStudents } from '@entities/student';
import { enrollmentApi, type Enrollment } from '@entities/enrollment';
import {
  downloadIssuedDocument,
  IssuedDocumentError,
  useDocumentTemplates,
  useIssueBulletin,
  useIssuedDocuments,
  useRevokeIssuedDocument,
  type IssuedDocument,
} from '@entities/issued-document';

const ISSUERS = ['director', 'admin', 'super_admin'];
const REVOKERS = ['director', 'super_admin'];
const KNOWN_ERRORS = [
  'NO_TEMPLATE',
  'NOT_CONFIGURED',
  'GRADES_INCOMPLETE',
  'CURRICULUM_NOT_CONFIGURED',
  'CONFLICT',
  'NOT_FOUND',
  'FORBIDDEN',
];

/** Students enrolled in the class, so the list only offers those who can have a bulletin. */
function useClassStudentIds(subSchoolId: string | undefined, classId: string) {
  return useQuery<Set<string>, Error>({
    queryKey: ['enrollments', 'by-class', subSchoolId, classId],
    enabled: !!subSchoolId && !!classId,
    queryFn: async () => {
      const query = { classId, subSchoolId };
      const response = await enrollmentApi.getAll(query);
      if (!response.IsSuccess) return new Set();
      return new Set((response.result as Enrollment[]).map((e) => e.studentId));
    },
  });
}

function formatDate(iso: string, locale: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export default function DocumentsPage() {
  const { subSchoolId, locale: routeLocale = 'fr' } = useParams({ strict: false }) as {
    subSchoolId?: string;
    locale?: string;
  };
  const navigate = useNavigate();
  const { data: templates = [] } = useDocumentTemplates(subSchoolId);
  const freeTemplates = templates
    .filter((tpl) => tpl.documentType === 'free' && tpl.activeVersion !== null && !tpl.archivedAt)
    .sort((a, b) => a.name.localeCompare(b.name));
  const templateName = (id: string) => templates.find((tpl) => tpl.id === id)?.name;
  const [freeTemplateId, setFreeTemplateId] = useState('');
  const { t, locale } = useTranslation();
  const role = useAppSelector(selectRole);
  const canIssue = !!role && ISSUERS.includes(role);
  const canRevoke = !!role && REVOKERS.includes(role);

  const explain = (error: unknown) => {
    const code = error instanceof IssuedDocumentError ? error.code : '';
    const message = error instanceof Error ? error.message : '';
    toast.error(
      KNOWN_ERRORS.includes(code)
        ? t(`documentsPage.errors.${code}`)
        : message || t('documentsPage.errors.unknown'),
    );
  };

  const [classId, setClassId] = useState('');
  const [periodId, setPeriodId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [toRevoke, setToRevoke] = useState<IssuedDocument | null>(null);
  const [reason, setReason] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: classes = [] } = useClasses(subSchoolId);
  const { data: periods = [] } = useAcademicPeriods(subSchoolId ? { subSchoolId } : undefined);
  const { data: students = [] } = useStudents(subSchoolId);
  const { data: enrolled } = useClassStudentIds(subSchoolId, classId);
  const {
    data: documents = [],
    isLoading,
    isError: listFailed,
    error: listError,
    refetch: retryList,
  } = useIssuedDocuments(subSchoolId);
  const issue = useIssueBulletin();
  const revoke = useRevokeIssuedDocument();

  const classStudents = useMemo(
    () =>
      students
        .filter((s) => enrolled?.has(s.id))
        .sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
        ),
    [students, enrolled],
  );

  const download = async (doc: IssuedDocument) => {
    setDownloading(doc.id);
    try {
      await downloadIssuedDocument(doc);
    } catch (error) {
      explain(error);
    } finally {
      setDownloading(null);
    }
  };

  const handleIssue = () => {
    if (!subSchoolId || !classId || !periodId || !studentId) return;
    issue.mutate(
      { subSchoolId, classId, academicPeriodId: periodId, studentId },
      {
        onSuccess: (doc) => {
          toast.success(t('documentsPage.issued', { number: doc.number }));
          void download(doc);
          setStudentId('');
        },
        onError: explain,
      },
    );
  };

  const handleRevoke = () => {
    if (!toRevoke || !reason.trim()) return;
    revoke.mutate(
      { id: toRevoke.id, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(t('documentsPage.revokeDialog.done', { number: toRevoke.number }));
          setToRevoke(null);
          setReason('');
        },
        onError: explain,
      },
    );
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <FileText className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">
            {t('documentsPage.title')}
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        {canIssue && (
          <section className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div>
              <h2 className="font-semibold">{t('documentsPage.free.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('documentsPage.free.subtitle')}</p>
            </div>
            {freeTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('documentsPage.free.none')}</p>
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-full max-w-sm space-y-1.5">
                  <Label>{t('documentsPage.free.template')}</Label>
                  <Select value={freeTemplateId} onValueChange={setFreeTemplateId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t('documentsPage.issue.choose')} />
                    </SelectTrigger>
                    <SelectContent>
                      {freeTemplates.map((tpl) => (
                        <SelectItem key={tpl.id} value={tpl.id}>
                          {tpl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  disabled={!freeTemplateId}
                  onClick={() =>
                    navigate({
                      to: '/$locale/sub-schools/$subSchoolId/documents/new/$templateId',
                      params: {
                        locale: routeLocale,
                        subSchoolId: subSchoolId ?? '',
                        templateId: freeTemplateId,
                      },
                    })
                  }
                >
                  <FilePlus2 className="mr-2 size-4" />
                  {t('documentsPage.free.fill')}
                </Button>
              </div>
            )}
          </section>
        )}

        {canIssue && (
          <section className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
            <div>
              <h2 className="font-semibold">{t('documentsPage.issue.title')}</h2>
              <p className="text-sm text-muted-foreground">{t('documentsPage.issue.subtitle')}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label>{t('documentsPage.issue.class')}</Label>
                <Select
                  value={classId}
                  onValueChange={(value) => {
                    setClassId(value);
                    setStudentId('');
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('documentsPage.issue.choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('documentsPage.issue.period')}</Label>
                <Select value={periodId} onValueChange={setPeriodId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('documentsPage.issue.choose')} />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('documentsPage.issue.student')}</Label>
                <Select value={studentId} onValueChange={setStudentId} disabled={!classId}>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        classId && enrolled && classStudents.length === 0
                          ? t('documentsPage.issue.noStudents')
                          : t('documentsPage.issue.choose')
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {classStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.lastName} {s.firstName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleIssue}
                disabled={!classId || !periodId || !studentId || issue.isPending}
              >
                {issue.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <FilePlus2 className="mr-2 size-4" />
                )}
                {t('documentsPage.issue.submit')}
              </Button>
            </div>
          </section>
        )}

        <section className="rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">{t('documentsPage.list.title')}</h2>
          </div>
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">
              <Spinner />
            </div>
          ) : listFailed ? (
            <div className="space-y-3 px-5 py-10 text-center text-sm">
              <p className="text-destructive">
                {t('documentsPage.loadFailed')}
                {listError?.message ? ` (${listError.message})` : ''}
              </p>
              <Button size="sm" variant="outline" onClick={() => retryList()}>
                {t('verifyDocument.error.retry')}
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-muted-foreground">
              {t('documentsPage.list.empty')}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('documentsPage.list.number')}</TableHead>
                    <TableHead>{t('documentsPage.list.student')}</TableHead>
                    <TableHead>{t('documentsPage.list.period')}</TableHead>
                    <TableHead>{t('documentsPage.list.issuedAt')}</TableHead>
                    <TableHead>{t('documentsPage.list.status')}</TableHead>
                    <TableHead className="text-right">{t('documentsPage.list.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-mono text-xs">{doc.number}</TableCell>
                      <TableCell>
                        {doc.payload.student?.fullName ?? templateName(doc.templateId) ?? '—'}
                      </TableCell>
                      <TableCell>
                        {doc.payload.period
                          ? `${doc.payload.period.name} ${doc.payload.period.schoolYear}`
                          : '—'}
                      </TableCell>
                      <TableCell>{formatDate(doc.issuedAt, locale)}</TableCell>
                      <TableCell>
                        {doc.status === 'issued' ? (
                          <Badge variant="secondary">{t('documentsPage.status.issued')}</Badge>
                        ) : (
                          <Badge variant="destructive" title={doc.revokedReason ?? undefined}>
                            {t('documentsPage.status.revoked')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => download(doc)}
                            disabled={downloading === doc.id}
                            title={t('documentsPage.actions.download')}
                          >
                            {downloading === doc.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Download className="size-4" />
                            )}
                            <span className="sr-only sm:not-sr-only sm:ml-1.5">
                              {t('documentsPage.actions.download')}
                            </span>
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a
                              href={`/verify/${doc.id}`}
                              target="_blank"
                              rel="noreferrer"
                              title={t('documentsPage.actions.verify')}
                            >
                              <ExternalLink className="size-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-1.5">
                                {t('documentsPage.actions.verify')}
                              </span>
                            </a>
                          </Button>
                          {canRevoke && doc.status === 'issued' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setToRevoke(doc)}
                              title={t('documentsPage.actions.revoke')}
                            >
                              <Ban className="size-4" />
                              <span className="sr-only sm:not-sr-only sm:ml-1.5">
                                {t('documentsPage.actions.revoke')}
                              </span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>

      <Dialog
        open={!!toRevoke}
        onOpenChange={(open) => {
          if (!open) {
            setToRevoke(null);
            setReason('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('documentsPage.revokeDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('documentsPage.revokeDialog.text', { number: toRevoke?.number ?? '' })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="revoke-reason">{t('documentsPage.revokeDialog.reason')}</Label>
            <Textarea
              id="revoke-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToRevoke(null)}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={!reason.trim() || revoke.isPending}
            >
              {t('documentsPage.revokeDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
