import { useState } from 'react';
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
} from '@/shared/ui';
import { FIELD_TYPES, type TemplateField } from '../model/layout';

export type FieldDraft = Omit<TemplateField, 'key'>;

/** Creates a field, or changes the settings of an existing one: label, type, required, source. */
export function FieldDialog({
  initial,
  onClose,
  onSubmit,
}: {
  /** null to create a new field. */
  initial: TemplateField | null;
  onClose: () => void;
  onSubmit: (field: FieldDraft) => void;
}) {
  const { t } = useTranslation();
  const [label, setLabel] = useState(initial?.label ?? '');
  const [type, setType] = useState<TemplateField['type']>(initial?.type ?? 'text');
  const [required, setRequired] = useState(initial?.required ?? true);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (label.trim()) onSubmit({ label: label.trim(), type, required, source: 'manual' });
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {initial ? t('templateEditor.field.editTitle') : t('templateEditor.field.newTitle')}
            </DialogTitle>
            <DialogDescription>{t('templateEditor.field.help')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="field-label">{t('templateEditor.field.label')}</Label>
            <Input
              id="field-label"
              autoFocus
              maxLength={80}
              value={label}
              placeholder={t('templateEditor.field.labelPlaceholder')}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t('templateEditor.field.type')}</Label>
              <Select value={type} onValueChange={(v) => setType(v as TemplateField['type'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {t(`templateEditor.field.types.${value}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('templateEditor.field.source')}</Label>
              {/* Only manual entry in v1: the module data comes later, as other sources. */}
              <Select value="manual" disabled>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">{t('templateEditor.field.sources.manual')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={required} onCheckedChange={(v) => setRequired(v === true)} />
            {t('templateEditor.field.required')}
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button type="submit" disabled={!label.trim()}>
              {initial ? t('templatesPage.library.save') : t('templateEditor.field.insert')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
