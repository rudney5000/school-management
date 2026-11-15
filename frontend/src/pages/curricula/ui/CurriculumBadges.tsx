import { useTranslation } from '@shared/lib';
import { Badge } from '@/shared/ui';
import type { Curriculum } from '@entities/curriculum';

/** "Programme officiel" or "Programme de l'école", plus the draft status for managers. */
export function CurriculumBadges({
  curriculum,
  showStatus,
}: {
  curriculum: Pick<Curriculum, 'type' | 'status'>;
  showStatus: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant={curriculum.type === 'national' ? 'blue' : 'secondary'}>
        {t(`curriculaPage.type.${curriculum.type}`)}
      </Badge>
      {showStatus &&
        (curriculum.status === 'published' ? (
          <Badge variant="success">{t('curriculaPage.status.published')}</Badge>
        ) : (
          <Badge variant="muted">{t('curriculaPage.status.draft')}</Badge>
        ))}
    </div>
  );
}
