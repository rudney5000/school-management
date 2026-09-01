import { useAppSelector } from '@shared/store/hooks';
import { selectRole } from '@features/auth/model/selectors';
import { ChildrenReportCard } from '@/pages/exams/ui/ChildrenReportCard';
import { StaffAssessmentsView } from '@/pages/exams/ui/StaffAssessmentsView';

export function AssessmentsPage() {
  const role = useAppSelector(selectRole);

  if (role === 'parent') {
    return <ChildrenReportCard />;
  }

  return <StaffAssessmentsView />;
}
