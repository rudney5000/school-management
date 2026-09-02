import { useState } from 'react';
import { FileCheck2 } from 'lucide-react';
import { useTeacherDossierStatus } from '@entities/teacher';
import { Badge, Button, Spinner } from '@shared/ui';
import CustomDrawer from '@shared/ui/custom-drawer/custom-drawer';
import { TeacherDocumentsPanel } from '@features/teacher';
import { useTranslation } from '@shared/lib';

interface TeacherDossierCardProps {
  teacherId: string;
  subSchoolId: string;
}

export function TeacherDossierCard({ teacherId, subSchoolId }: TeacherDossierCardProps) {
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: dossierStatus, isLoading } = useTeacherDossierStatus({
    id: teacherId,
    subSchoolId,
  });

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        <Spinner />
        {t('dashboard.teachers.documents.dossier.loading')}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-zinc-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(23,85,236,0.04)] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-4 w-4 text-[#1755EC]" />
          <h4 className="text-sm font-semibold text-zinc-900">
            {t('dashboard.teachers.documents.dossier.title')}
          </h4>
        </div>
        <Badge variant={dossierStatus?.isComplete ? 'success' : 'outline'}>
          {dossierStatus?.isComplete
            ? t('dashboard.teachers.documents.dossier.complete')
            : t('dashboard.teachers.documents.dossier.incomplete')}
        </Badge>
      </div>

      <Button size="sm" variant="outline" className="w-full" onClick={() => setIsDrawerOpen(true)}>
        {t('dashboard.teachers.documents.dossier.manageDocuments')}
      </Button>

      <CustomDrawer
        isOpen={isDrawerOpen}
        handleOpen={() => setIsDrawerOpen(!isDrawerOpen)}
        drawerTitle={t('dashboard.teachers.documents.dossier.drawerTitle')}
        drawerDescription={t('dashboard.teachers.documents.dossier.drawerDescription')}
      >
        <TeacherDocumentsPanel teacherId={teacherId} subSchoolId={subSchoolId} />
      </CustomDrawer>
    </div>
  );
}
