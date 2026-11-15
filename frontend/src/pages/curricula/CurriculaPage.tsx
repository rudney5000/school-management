import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { BookMarked, FileText, Plus } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { useAppSelector } from '@shared/store/hooks';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui';
import { selectRole } from '@features/auth/model/selectors';
import { CurriculumFormDialog } from '@features/curriculum-manage';
import {
  CURRICULUM_TYPES,
  useCurricula,
  type Curriculum,
  type CurriculumDetail,
  type CurriculumType,
} from '@entities/curriculum';
import { CurriculumBadges } from './ui/CurriculumBadges';
import { CurriculumDetailSheet } from './ui/CurriculumDetailSheet';

const MANAGERS = ['admin', 'director', 'super_admin'];
const ALL = 'all';

/** The filter choices, taken from the programmes themselves so every role gets the same ones. */
function useFilterOptions(curricula: Curriculum[]) {
  return useMemo(() => {
    const years = [...new Set(curricula.map((c) => c.schoolYear))].sort().reverse();
    const classes = new Map<string, string>();
    for (const curriculum of curricula) {
      for (const klass of curriculum.classes) classes.set(klass.id, klass.name);
    }
    const sortedClasses = [...classes.entries()].sort(([, a], [, b]) => a.localeCompare(b));
    return { years, classes: sortedClasses };
  }, [curricula]);
}

export default function CurriculaPage() {
  const { subSchoolId } = useParams({ strict: false }) as { subSchoolId?: string };
  const { t } = useTranslation();
  const role = useAppSelector(selectRole);
  const canManage = !!role && MANAGERS.includes(role);

  const [year, setYear] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [classId, setClassId] = useState(ALL);
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState<{ open: boolean; curriculum?: CurriculumDetail }>({
    open: false,
  });

  const {
    data: curricula = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCurricula({ subSchoolId }, !!role);
  const options = useFilterOptions(curricula);

  const visible = curricula.filter(
    (c) =>
      (year === ALL || c.schoolYear === year) &&
      (type === ALL || c.type === (type as CurriculumType)) &&
      (classId === ALL || c.classes.some((klass) => klass.id === classId)),
  );

  const filters = [
    {
      label: t('curriculaPage.filters.year'),
      allLabel: t('curriculaPage.filters.allYears'),
      value: year,
      onChange: setYear,
      items: options.years.map((y) => [y, y] as const),
    },
    {
      label: t('curriculaPage.filters.type'),
      allLabel: t('curriculaPage.filters.allTypes'),
      value: type,
      onChange: setType,
      items: CURRICULUM_TYPES.map((value) => [value, t(`curriculaPage.type.${value}`)] as const),
    },
    {
      label: t('curriculaPage.filters.class'),
      allLabel: t('curriculaPage.filters.allClasses'),
      value: classId,
      onChange: setClassId,
      items: options.classes,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-20 border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <BookMarked className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="flex-1 text-lg font-bold tracking-tight sm:text-xl">
            {t('curriculaPage.title')}
          </h1>
          {canManage && subSchoolId && (
            <Button onClick={() => setForm({ open: true })}>
              <Plus className="size-4 sm:mr-2" />
              <span className="sr-only sm:not-sr-only">{t('curriculaPage.add')}</span>
            </Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-sm text-muted-foreground">
          {t(canManage ? 'curriculaPage.subtitleManager' : 'curriculaPage.subtitleReader')}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {filters.map((filter) => (
            <Select key={filter.label} value={filter.value} onValueChange={filter.onChange}>
              <SelectTrigger className="w-full bg-background" aria-label={filter.label}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{filter.allLabel}</SelectItem>
                {filter.items.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="space-y-3 py-10 text-center text-sm">
            <p className="text-destructive">
              {t('curriculaPage.loadFailed')}
              {error?.message ? ` (${error.message})` : ''}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {t('curriculaPage.retry')}
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card px-5 py-16 text-center text-sm text-muted-foreground">
            {t(
              curricula.length === 0
                ? canManage
                  ? 'curriculaPage.emptyManager'
                  : 'curriculaPage.emptyReader'
                : 'curriculaPage.noMatch',
            )}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((curriculum) => (
              <li key={curriculum.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(curriculum.id)}
                  className="flex h-full w-full flex-col gap-3 rounded-xl bg-card p-5 text-left ring-1 ring-foreground/10 transition hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <CurriculumBadges curriculum={curriculum} showStatus={canManage} />
                  <div className="space-y-1">
                    <h2 className="font-semibold leading-snug">{curriculum.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      {curriculum.schoolYear}
                      {curriculum.course ? ` · ${curriculum.course.name}` : ''}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {curriculum.classes.map((klass) => klass.name).join(', ')}
                  </p>
                  <p className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FileText className="size-3.5" aria-hidden />
                    {t('curriculaPage.fileCount', { count: curriculum.fileCount })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <CurriculumDetailSheet
        curriculumId={openId}
        onClose={() => setOpenId(null)}
        subSchoolId={subSchoolId}
        canManage={canManage}
        onEdit={(curriculum) => setForm({ open: true, curriculum })}
      />

      {canManage && subSchoolId && (
        <CurriculumFormDialog
          open={form.open}
          onOpenChange={(open) => setForm((current) => ({ ...current, open }))}
          subSchoolId={subSchoolId}
          curriculum={form.curriculum}
          onSaved={(saved) => setOpenId(saved.id)}
        />
      )}
    </div>
  );
}
