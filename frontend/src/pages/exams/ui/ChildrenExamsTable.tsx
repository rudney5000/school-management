import { useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useTranslation } from '@shared/lib';
import { ExamStatus, useMyChildrenExams } from '@entities/exams';
import { useCoursesList } from '@entities/courses';
import { useAcademicPeriods } from '@entities/academic-period';
import { ExamStats } from '@/pages/exams/ui/ExamStats';
import { getExamColumns } from '@/pages/exams/ui/ExamColumns';
import { ExamTable } from '@/pages/exams/ui/ExamTable';
import { ExamTableToolbar } from '@/pages/exams/ui/ExamTableToolbar';

export function ChildrenExamsTable() {
  const { subSchoolId } = useParams({ strict: false });
  const { t } = useTranslation();

  const [activeFilter, setActiveFilter] = useState('all');

  const { data, isLoading, isError } = useMyChildrenExams(subSchoolId);
  const { data: academicPeriods = [] } = useAcademicPeriods(
    subSchoolId ? { subSchoolId } : undefined,
  );
  const { data: courses } = useCoursesList(subSchoolId);

  const statusFilters = [
    { id: 'all', label: t('dashboard.exams.filters.all') },
    { id: ExamStatus.Scheduled, label: t('dashboard.exams.filters.scheduled') },
    { id: ExamStatus.Ongoing, label: t('dashboard.exams.filters.ongoing') },
    { id: ExamStatus.Completed, label: t('dashboard.exams.filters.completed') },
    { id: ExamStatus.Cancelled, label: t('dashboard.exams.filters.cancelled') },
  ];

  const filteredData = useMemo(() => {
    return (data ?? []).filter((exam) => activeFilter === 'all' || exam.status === activeFilter);
  }, [data, activeFilter]);

  const courseMap = useMemo(() => new Map(courses?.map((c) => [c.id, c.name]) ?? []), [courses]);

  const academicPeriodMap = useMemo(
    () => new Map(academicPeriods?.map((p) => [p.id, p.name]) ?? []),
    [academicPeriods],
  );

  const columns = useMemo(
    () =>
      getExamColumns({
        t,
        examToEdit: undefined,
        courseMap,
        academicPeriodMap,
      }),
    [t, courseMap, academicPeriodMap],
  );

  return (
    <div className="space-y-6">
      <ExamStats exams={filteredData} showAverage={false} />
      <ExamTable
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        data={filteredData}
        title="children exams table"
        toolbar={({ onSearchChange }) => (
          <ExamTableToolbar
            onSearchChange={onSearchChange}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            statusFilters={statusFilters}
            classes={[]}
            selectedClassId="all"
            onClassChange={() => {}}
            academicPeriods={academicPeriods}
            selectedPeriodId="all"
            onPeriodChange={() => {}}
            showTeacherToggle={false}
            teacherOnly={false}
            onTeacherOnlyChange={() => {}}
          />
        )}
      />
    </div>
  );
}
