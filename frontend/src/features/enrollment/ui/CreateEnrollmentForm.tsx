import { useState } from 'react';
import { useCreateEnrollment } from '@entities/enrollment';
import { useClasses } from '@entities/class';
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui';
import { useTranslation } from '@shared/lib';

interface CreateEnrollmentFormProps {
  studentId: string;
  subSchoolId: string;
}

export function CreateEnrollmentForm({ studentId, subSchoolId }: CreateEnrollmentFormProps) {
  const { t } = useTranslation();
  const [classId, setClassId] = useState('');
  const { data: classes } = useClasses(subSchoolId);
  const { mutate, isPending } = useCreateEnrollment();

  return (
    <div className="space-y-2">
      <Select value={classId} onValueChange={setClassId}>
        <SelectTrigger>
          <SelectValue placeholder={t('dashboard.enrollment.create.chooseClass')} />
        </SelectTrigger>
        <SelectContent>
          {classes?.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        className="w-full"
        disabled={!classId || isPending}
        onClick={() => mutate({ studentId, classId })}
      >
        {isPending
          ? t('dashboard.enrollment.create.creating')
          : t('dashboard.enrollment.create.createEnrollment')}
      </Button>
    </div>
  );
}
