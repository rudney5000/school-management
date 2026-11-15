import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@shared/lib';
import {
  Button,
  Checkbox,
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
  Textarea,
} from '@/shared/ui';
import { useClasses, type Class } from '@entities/class';
import { useCourses } from '@entities/courses';
import {
  CURRICULUM_TYPES,
  CurriculumError,
  currentSchoolYear,
  useCreateCurriculum,
  useUpdateCurriculum,
  type CurriculumDetail,
  type CurriculumType,
} from '@entities/curriculum';

const NO_COURSE = '__none';
const SCHOOL_YEAR = /^(\d{4})-(\d{4})$/;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subSchoolId: string;
  /** Edits this programme; creates a new one when absent. */
  curriculum?: CurriculumDetail;
  onSaved?: (curriculum: CurriculumDetail) => void;
};

function isValidSchoolYear(value: string) {
  const match = SCHOOL_YEAR.exec(value);
  return !!match && Number(match[2]) === Number(match[1]) + 1;
}

/** Classes grouped by level, so a whole level (7e A, 7e B, 7e C) can be ticked at once. */
function groupByLevel(classes: Class[], otherLabel: string) {
  const groups = new Map<string, Class[]>();
  for (const klass of [...classes].sort((a, b) => a.name.localeCompare(b.name))) {
    const level = klass.gradeLevel?.trim() || otherLabel;
    groups.set(level, [...(groups.get(level) ?? []), klass]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CurriculumFormDialog({
  open,
  onOpenChange,
  subSchoolId,
  curriculum,
  onSaved,
}: Props) {
  const { t } = useTranslation();
  const { data: classes = [] } = useClasses(subSchoolId);
  const { data: courses = [] } = useCourses(subSchoolId);
  const create = useCreateCurriculum(subSchoolId);
  const update = useUpdateCurriculum(subSchoolId);
  const saving = create.isPending || update.isPending;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CurriculumType>('national');
  const [courseId, setCourseId] = useState(NO_COURSE);
  const [schoolYear, setSchoolYear] = useState(currentSchoolYear());
  const [classIds, setClassIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setTitle(curriculum?.title ?? '');
    setDescription(curriculum?.description ?? '');
    setType(curriculum?.type ?? 'national');
    setCourseId(curriculum?.courseId ?? NO_COURSE);
    setSchoolYear(curriculum?.schoolYear ?? currentSchoolYear());
    setClassIds(new Set(curriculum?.classes.map((c) => c.id) ?? []));
  }, [open, curriculum]);

  const levels = useMemo(
    () => groupByLevel(classes, t('curriculaPage.form.otherLevel')),
    [classes, t],
  );

  const toggle = (ids: string[], checked: boolean) =>
    setClassIds((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (checked) next.add(id);
        else next.delete(id);
      }
      return next;
    });

  const yearValid = isValidSchoolYear(schoolYear);
  const canSave = title.trim().length > 0 && yearValid && classIds.size > 0 && !saving;

  const handleSave = () => {
    if (!canSave) return;
    const dto = {
      title: title.trim(),
      type,
      schoolYear,
      classIds: [...classIds],
    };
    const onError = (error: Error) => {
      const code = error instanceof CurriculumError ? error.code : '';
      toast.error(code === 'VALIDATION_ERROR' ? t('curriculaPage.errors.invalid') : error.message);
    };
    const onSuccess = (saved: CurriculumDetail) => {
      toast.success(t(curriculum ? 'curriculaPage.form.updated' : 'curriculaPage.form.created'));
      onOpenChange(false);
      onSaved?.(saved);
    };

    if (curriculum) {
      update.mutate(
        {
          id: curriculum.id,
          dto: {
            ...dto,
            description: description.trim() || null,
            courseId: courseId === NO_COURSE ? null : courseId,
          },
        },
        { onSuccess, onError },
      );
    } else {
      create.mutate(
        {
          ...dto,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(courseId !== NO_COURSE ? { courseId } : {}),
        },
        { onSuccess, onError },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(curriculum ? 'curriculaPage.form.editTitle' : 'curriculaPage.form.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('curriculaPage.form.subtitle')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="curriculum-title">{t('curriculaPage.form.title')}</Label>
            <Input
              id="curriculum-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              placeholder={t('curriculaPage.form.titlePlaceholder')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t('curriculaPage.form.type')}</Label>
              <Select value={type} onValueChange={(value) => setType(value as CurriculumType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRICULUM_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`curriculaPage.type.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('curriculaPage.form.course')}</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_COURSE}>{t('curriculaPage.form.noCourse')}</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="curriculum-year">{t('curriculaPage.form.schoolYear')}</Label>
              <Input
                id="curriculum-year"
                value={schoolYear}
                onChange={(e) => setSchoolYear(e.target.value.trim())}
                placeholder="2026-2027"
                aria-invalid={!yearValid}
              />
              {!yearValid && (
                <p className="text-xs text-destructive">{t('curriculaPage.form.schoolYearHint')}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="curriculum-description">{t('curriculaPage.form.description')}</Label>
            <Textarea
              id="curriculum-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={3}
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              {t('curriculaPage.form.classes')}{' '}
              <span className="font-normal text-muted-foreground">
                ({t('curriculaPage.form.selected', { count: classIds.size })})
              </span>
            </legend>
            {levels.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('curriculaPage.form.noClasses')}</p>
            ) : (
              <div className="space-y-3 rounded-lg border p-3">
                {levels.map(([level, levelClasses]) => {
                  const ids = levelClasses.map((c) => c.id);
                  const selected = ids.filter((id) => classIds.has(id)).length;
                  return (
                    <div key={level} className="space-y-1.5">
                      <label className="flex items-center gap-2 text-sm font-semibold">
                        <Checkbox
                          checked={
                            selected === ids.length ? true : selected > 0 ? 'indeterminate' : false
                          }
                          onCheckedChange={(checked) => toggle(ids, checked === true)}
                        />
                        {level}
                      </label>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-6">
                        {levelClasses.map((klass) => (
                          <label key={klass.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={classIds.has(klass.id)}
                              onCheckedChange={(checked) => toggle([klass.id], checked === true)}
                            />
                            {klass.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </fieldset>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('curriculaPage.form.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
            {t('curriculaPage.form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
