import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
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
import type { LayoutBlock } from '../model/layout';
import type { VariableInfo } from '../model/variables';
import { defaultGradeLabel, GRADE_COLUMNS, type GradeColumn } from './BlockPreview';
import { VariableInput } from './VariableMenu';

type Draft = Record<string, unknown>;
type Patch = (patch: Draft) => void;

function Row({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      {label}
    </label>
  );
}

function Choice<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <Row label={label}>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Row>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label: string;
}) {
  return (
    <Row label={label}>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(n))
            onChange(Math.min(max, Math.max(min, n)));
        }}
      />
    </Row>
  );
}

/** Move up / move down / remove buttons of a list row. */
function RowActions({
  index,
  count,
  onMove,
  onRemove,
  min = 1,
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  min?: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex shrink-0 gap-0.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label={t('templateEditor.blockDialog.moveUp')}
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={t('templateEditor.blockDialog.moveDown')}
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-destructive"
        disabled={count <= min}
        onClick={() => onRemove(index)}
        aria-label={t('templateEditor.blockDialog.remove')}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function moved<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

/** Editing helpers for a list property of the block (lines, items, slots). */
function useList<T extends Draft>(draft: Draft, key: string, set: Patch) {
  const list = (draft[key] as T[] | undefined) ?? [];
  return {
    list,
    change: (index: number, patch: Partial<T>) =>
      set({ [key]: list.map((item, i) => (i === index ? { ...item, ...patch } : item)) }),
    move: (from: number, to: number) => set({ [key]: moved(list, from, to) }),
    remove: (index: number) => set({ [key]: list.filter((_, i) => i !== index) }),
    add: (item: T) => set({ [key]: [...list, item] }),
  };
}

const ALIGNS = ['left', 'center', 'right'] as const;

function HeaderForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  const lines = useList<{ text: string; size?: number; bold?: boolean }>(draft, 'lines', set);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice
          label={t('templateEditor.blockDialog.align')}
          value={(draft.align as (typeof ALIGNS)[number]) ?? 'center'}
          options={ALIGNS.map((a) => ({
            value: a,
            label: t(`templateEditor.blockDialog.aligns.${a}`),
          }))}
          onChange={(align) => set({ align })}
        />
        <div className="flex items-end pb-2">
          <Check
            checked={draft.band === true}
            onChange={(band) => set({ band })}
            label={t('templateEditor.blocks.header.band')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>{t('templateEditor.blocks.header.lines')}</Label>
        {lines.list.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <VariableInput
                value={line.text}
                variables={variables}
                onChange={(text) => lines.change(i, { text })}
              />
            </div>
            <Input
              type="number"
              min={5}
              max={40}
              step={0.5}
              className="w-16"
              title={t('templateEditor.blockDialog.size')}
              value={line.size ?? ''}
              placeholder="10"
              onChange={(e) =>
                lines.change(i, {
                  size: e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
            />
            <Checkbox
              title={t('templateEditor.toolbar.bold')}
              checked={line.bold === true}
              onCheckedChange={(v) => lines.change(i, { bold: v === true })}
            />
            <RowActions
              index={i}
              count={lines.list.length}
              onMove={lines.move}
              onRemove={lines.remove}
            />
          </div>
        ))}
        {lines.list.length < 8 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => lines.add({ text: 'Texte' })}
          >
            <Plus className="mr-1 size-4" />
            {t('templateEditor.blocks.header.addLine')}
          </Button>
        )}
      </div>
    </div>
  );
}

function TitleForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Row label={t('templateEditor.blocks.title.text')}>
        <VariableInput
          value={String(draft.text ?? '')}
          variables={variables}
          onChange={(text) => set({ text })}
        />
      </Row>
      <Row label={t('templateEditor.blocks.title.subtitle')}>
        <VariableInput
          value={String(draft.subtitle ?? '')}
          variables={variables}
          onChange={(subtitle) => set({ subtitle: subtitle || undefined })}
        />
      </Row>
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label={t('templateEditor.blockDialog.size')}
          value={(draft.size as number) ?? 16}
          min={8}
          max={40}
          onChange={(size) => set({ size })}
        />
        <Choice
          label={t('templateEditor.blockDialog.align')}
          value={(draft.align as (typeof ALIGNS)[number]) ?? 'center'}
          options={ALIGNS.map((a) => ({
            value: a,
            label: t(`templateEditor.blockDialog.aligns.${a}`),
          }))}
          onChange={(align) => set({ align })}
        />
      </div>
    </div>
  );
}

function TextForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Row label={t('templateEditor.blocks.text.text')}>
        <VariableInput
          multiline
          value={String(draft.text ?? '')}
          variables={variables}
          onChange={(text) => set({ text })}
        />
      </Row>
      <p className="text-xs text-muted-foreground">{t('templateEditor.blocks.text.formHelp')}</p>
    </div>
  );
}

function InfoGridForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  const items = useList<{ label: string; value: string }>(draft, 'items', set);
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberInput
          label={t('templateEditor.blocks.infoGrid.columns')}
          value={(draft.columns as number) ?? 2}
          min={1}
          max={4}
          onChange={(columns) => set({ columns })}
        />
        <div className="flex items-end pb-2">
          <Check
            checked={draft.band === true}
            onChange={(band) => set({ band })}
            label={t('templateEditor.blocks.infoGrid.band')}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[10rem_1fr_6.5rem] gap-2 text-xs font-medium text-muted-foreground">
          <span>{t('templateEditor.blocks.infoGrid.label')}</span>
          <span>{t('templateEditor.blocks.infoGrid.value')}</span>
        </div>
        {items.list.map((item, i) => (
          <div key={i} className="grid grid-cols-[10rem_1fr_6.5rem] items-center gap-2">
            <Input
              value={item.label}
              onChange={(e) => items.change(i, { label: e.target.value })}
            />
            <VariableInput
              value={item.value}
              variables={variables}
              onChange={(value) => items.change(i, { value })}
            />
            <RowActions
              index={i}
              count={items.list.length}
              onMove={items.move}
              onRemove={items.remove}
            />
          </div>
        ))}
        {items.list.length < 16 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => items.add({ label: 'Libellé', value: '' })}
          >
            <Plus className="mr-1 size-4" />
            {t('templateEditor.blocks.infoGrid.add')}
          </Button>
        )}
      </div>
    </div>
  );
}

function GradesTableForm({ draft, set }: FormProps) {
  const { t } = useTranslation();
  const shown = (draft.columns as GradeColumn[] | undefined) ?? GRADE_COLUMNS;
  // Shown columns first, in their order, then the hidden ones.
  const order = [...shown, ...GRADE_COLUMNS.filter((c) => !shown.includes(c))];
  const labels = (draft.labels as Record<string, string> | undefined) ?? {};
  const setLabel = (key: string, value: string) => {
    const next = { ...labels, [key]: value };
    if (!value.trim()) delete next[key];
    set({ labels: Object.keys(next).length ? next : undefined });
  };
  const toggle = (column: GradeColumn, on: boolean) => {
    const next = on
      ? order.filter((c) => c === column || shown.includes(c))
      : shown.filter((c) => c !== column);
    if (next.length) set({ columns: next });
  };
  const move = (from: number, to: number) => set({ columns: moved(shown, from, to) });

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{t('templateEditor.blocks.gradesTable.columns')}</Label>
        <p className="text-xs text-muted-foreground">
          {t('templateEditor.blocks.gradesTable.columnsHelp')}
        </p>
        {order.map((column) => {
          const index = shown.indexOf(column);
          const on = index >= 0;
          return (
            <div key={column} className="flex items-center gap-2">
              <Checkbox
                checked={on}
                disabled={on && shown.length === 1}
                onCheckedChange={(v) => toggle(column, v === true)}
                aria-label={t(`templateEditor.blocks.gradesTable.data.${column}`)}
              />
              <span className="w-36 shrink-0 text-sm">
                {t(`templateEditor.blocks.gradesTable.data.${column}`)}
              </span>
              <Input
                className="h-8"
                disabled={!on}
                value={labels[column] ?? ''}
                placeholder={defaultGradeLabel(column)}
                onChange={(e) => setLabel(column, e.target.value)}
                aria-label={t('templateEditor.blocks.gradesTable.heading')}
              />
              <div className="flex shrink-0 gap-0.5">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  disabled={!on || index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={t('templateEditor.blockDialog.moveUp')}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  disabled={!on || index === shown.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={t('templateEditor.blockDialog.moveDown')}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label>{t('templateEditor.blocks.gradesTable.results')}</Label>
        {(
          [
            ['showTotals', 'total', 'percent'],
            ['showRank', 'rank'],
          ] as const
        ).map(([flag, ...keys]) => (
          <div key={flag} className="flex flex-wrap items-center gap-2">
            <div className="w-44 shrink-0">
              <Check
                checked={draft[flag] !== false}
                onChange={(value) => set({ [flag]: value })}
                label={t(`templateEditor.blocks.gradesTable.${flag}`)}
              />
            </div>
            {keys.map((key) => (
              <Input
                key={key}
                className="h-8 w-36"
                disabled={draft[flag] === false}
                value={labels[key] ?? ''}
                placeholder={defaultGradeLabel(key)}
                onChange={(e) => setLabel(key, e.target.value)}
                aria-label={t('templateEditor.blocks.gradesTable.heading')}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SignaturesForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  const slots = useList<{ role: string; name?: string }>(draft, 'slots', set);
  return (
    <div className="space-y-4">
      <Row label={t('templateEditor.blocks.signatures.place')}>
        <VariableInput
          value={String(draft.place ?? '')}
          variables={variables}
          onChange={(place) => set({ place: place || undefined })}
        />
      </Row>
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_6.5rem] gap-2 text-xs font-medium text-muted-foreground">
          <span>{t('templateEditor.blocks.signatures.role')}</span>
          <span>{t('templateEditor.blocks.signatures.slotName')}</span>
        </div>
        {slots.list.map((slot, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_6.5rem] items-center gap-2">
            <VariableInput
              value={slot.role}
              variables={variables}
              onChange={(role) => slots.change(i, { role })}
            />
            <VariableInput
              value={slot.name ?? ''}
              variables={variables}
              onChange={(name) => slots.change(i, { name: name || undefined })}
            />
            <RowActions
              index={i}
              count={slots.list.length}
              onMove={slots.move}
              onRemove={slots.remove}
            />
          </div>
        ))}
        {slots.list.length < 3 && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => slots.add({ role: 'Signature' })}
          >
            <Plus className="mr-1 size-4" />
            {t('templateEditor.blocks.signatures.add')}
          </Button>
        )}
      </div>
    </div>
  );
}

const QR_POSITIONS = ['bottom-left', 'bottom-right', 'inline'] as const;

function QrForm({ draft, set, variables }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Choice
          label={t('templateEditor.blocks.qrVerify.position')}
          value={(draft.position as (typeof QR_POSITIONS)[number]) ?? 'bottom-left'}
          options={QR_POSITIONS.map((p) => ({
            value: p,
            label: t(`templateEditor.blocks.qrVerify.positionNames.${p}`),
          }))}
          onChange={(position) => set({ position })}
        />
        <NumberInput
          label={t('templateEditor.blocks.qrVerify.size')}
          value={(draft.size as number) ?? 22}
          min={12}
          max={60}
          onChange={(size) => set({ size })}
        />
      </div>
      <Row label={t('templateEditor.blocks.qrVerify.caption')}>
        <VariableInput
          multiline
          value={String(draft.caption ?? '')}
          variables={variables}
          placeholder={t('templateEditor.blocks.qrVerify.captionPlaceholder')}
          onChange={(caption) => set({ caption: caption || undefined })}
        />
      </Row>
    </div>
  );
}

function SpacerForm({ draft, set }: FormProps) {
  const { t } = useTranslation();
  return (
    <NumberInput
      label={t('templateEditor.blocks.spacer.height')}
      value={(draft.height as number) ?? 6}
      min={1}
      max={150}
      onChange={(height) => set({ height })}
    />
  );
}

function WatermarkForm({ draft, set }: FormProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Row label={t('templateEditor.blocks.watermark.text')}>
        <Input value={String(draft.text ?? '')} onChange={(e) => set({ text: e.target.value })} />
      </Row>
      <NumberInput
        label={t('templateEditor.blocks.watermark.opacity')}
        value={Math.round(((draft.opacity as number) ?? 0.08) * 100)}
        min={2}
        max={50}
        onChange={(percent) => set({ opacity: percent / 100 })}
      />
    </div>
  );
}

interface FormProps {
  draft: Draft;
  set: Patch;
  variables: VariableInfo[];
}

const FORMS: Record<string, (props: FormProps) => ReactNode> = {
  header: HeaderForm,
  title: TitleForm,
  text: TextForm,
  infoGrid: InfoGridForm,
  gradesTable: GradesTableForm,
  signatures: SignaturesForm,
  qrVerify: QrForm,
  spacer: SpacerForm,
  watermark: WatermarkForm,
};

export const hasSettings = (type: string) => type in FORMS;

/** The settings of one block of the page; the page is updated when the dialog is applied. */
export function BlockDialog({
  block,
  variables,
  onClose,
  onSubmit,
}: {
  block: LayoutBlock;
  variables: VariableInfo[];
  onClose: () => void;
  onSubmit: (block: LayoutBlock) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<Draft>(block);
  const set: Patch = (patch) =>
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      for (const [key, value] of Object.entries(patch)) if (value === undefined) delete next[key];
      return next;
    });
  const Form = FORMS[block.type];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(draft as LayoutBlock);
          }}
        >
          <DialogHeader>
            <DialogTitle>{t(`templateEditor.blocks.${block.type}.name`)}</DialogTitle>
            <DialogDescription>{t(`templateEditor.blocks.${block.type}.help`)}</DialogDescription>
          </DialogHeader>
          {Form && <Form draft={draft} set={set} variables={variables} />}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button type="submit">{t('templateEditor.blockDialog.apply')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
