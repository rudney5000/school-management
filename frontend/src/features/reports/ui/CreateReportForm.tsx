import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/ui/dialog';
import { Button } from '@shared/ui/button';
import { Input } from '@shared/ui/input';
import { Textarea } from '@shared/ui/textarea';
import { Label } from '@shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select';
import { Checkbox } from '@shared/ui/checkbox';
import { useCreateReport } from '@entities/report';
import type { CreateReportDto } from '@entities/report/model/dto';
import { setCreateModalOpen } from '@entities/report';
import { useDispatch } from 'react-redux';
import { useTranslation } from '@shared/lib';

export const CreateReportForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateReportDto>({
    category: 'harassment',
    description: '',
    isAnonymous: false,
  });

  const mutation = useCreateReport();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData, {
      onSuccess: () => {
        dispatch(setCreateModalOpen(false));
        window.location.reload();
      },
    });
  };

  return (
    <Dialog open onOpenChange={(open) => dispatch(setCreateModalOpen(open))}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('dashboard.reports.form.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">{t('dashboard.reports.form.category')}</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('dashboard.reports.form.categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="harassment">
                  {t('dashboard.reports.category.harassment')}
                </SelectItem>
                <SelectItem value="behavior">{t('dashboard.reports.category.behavior')}</SelectItem>
                <SelectItem value="material">{t('dashboard.reports.category.material')}</SelectItem>
                <SelectItem value="security">{t('dashboard.reports.category.security')}</SelectItem>
                <SelectItem value="teacher_absence">
                  {t('dashboard.reports.category.teacher_absence')}
                </SelectItem>
                <SelectItem value="other">{t('dashboard.reports.category.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.category === 'other' && (
            <div className="space-y-2">
              <Label htmlFor="otherCategoryLabel">
                {t('dashboard.reports.form.otherCategory')}
              </Label>
              <Input
                id="otherCategoryLabel"
                value={formData.otherCategoryLabel || ''}
                onChange={(e) => setFormData({ ...formData, otherCategoryLabel: e.target.value })}
                placeholder={t('dashboard.reports.form.otherCategoryPlaceholder')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">{t('dashboard.reports.form.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('dashboard.reports.form.descriptionPlaceholder')}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="involvedPersonName">{t('dashboard.reports.form.involvedPerson')}</Label>
            <Input
              id="involvedPersonName"
              value={formData.involvedPersonName || ''}
              onChange={(e) => setFormData({ ...formData, involvedPersonName: e.target.value })}
              placeholder={t('dashboard.reports.form.involvedPersonPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="involvedPersonRole">
              {t('dashboard.reports.form.involvedPersonRole')}
            </Label>
            <Select
              value={formData.involvedPersonRole || ''}
              onValueChange={(value) =>
                setFormData({ ...formData, involvedPersonRole: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t('dashboard.reports.form.rolePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher">{t('dashboard.reports.role.teacher')}</SelectItem>
                <SelectItem value="staff">{t('dashboard.reports.role.staff')}</SelectItem>
                <SelectItem value="director">{t('dashboard.reports.role.director')}</SelectItem>
                <SelectItem value="student">{t('dashboard.reports.role.student')}</SelectItem>
                <SelectItem value="other">{t('dashboard.reports.role.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: !!checked })}
            />
            <Label htmlFor="isAnonymous">{t('dashboard.reports.form.isAnonymous')}</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch(setCreateModalOpen(false))}
            >
              {t('dashboard.reports.form.cancel')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? t('dashboard.reports.form.submitting')
                : t('dashboard.reports.form.submit')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
