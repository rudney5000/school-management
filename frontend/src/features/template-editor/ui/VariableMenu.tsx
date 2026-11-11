import { useContext, useRef, type ReactNode } from 'react';
import { Database } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { cn } from '@shared/lib/utils';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Input,
  Textarea,
} from '@/shared/ui';
import {
  groupOf,
  insertableVariables,
  VARIABLE_GROUPS,
  variableLabelKey,
  variableText,
  type VariableInfo,
} from '../model/variables';
import { PreviewContext } from './BlockPreview';

/**
 * The data a template can print, grouped (student, class, period…). Each
 * entry shows its label and its value in the sample, so the choice is clear.
 */
export function VariableMenu({
  variables,
  onPick,
  trigger,
  align = 'start',
}: {
  variables: VariableInfo[];
  onPick: (path: string) => void;
  trigger: ReactNode;
  align?: 'start' | 'end';
}) {
  const { t } = useTranslation();
  const { sample } = useContext(PreviewContext);
  const list = insertableVariables(variables);
  const groups = [...VARIABLE_GROUPS, 'other']
    .map((group) => ({ group, items: list.filter((v) => groupOf(v.path) === group) }))
    .filter((g) => g.items.length);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-56">
        {groups.map(({ group, items }) => (
          <DropdownMenuSub key={group}>
            <DropdownMenuSubTrigger>
              {t(`templateEditor.variableGroups.${group}`)}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-72">
              {items.map((v) => (
                <DropdownMenuItem key={v.path} onSelect={() => onPick(v.path)}>
                  <span className="flex-1">
                    {t(variableLabelKey(v.path), { defaultValue: v.path })}
                  </span>
                  <span className="max-w-32 truncate text-xs text-muted-foreground">
                    {variableText(v.path, sample)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * A text input of a block's settings that may hold `{{variables}}`: the
 * button next to it inserts one where the cursor is.
 */
export function VariableInput({
  value,
  onChange,
  variables,
  multiline,
  placeholder,
  id,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  variables: VariableInfo[];
  multiline?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);

  const insert = (path: string) => {
    const at = caret.current ?? value.length;
    const token = `{{${path}}}`;
    onChange(value.slice(0, at) + token + value.slice(at));
    const next = at + token.length;
    caret.current = next;
    requestAnimationFrame(() => {
      ref.current?.focus();
      ref.current?.setSelectionRange(next, next);
    });
  };

  const common = {
    id,
    ref,
    value,
    placeholder,
    onChange: (e: { target: { value: string; selectionStart: number | null } }) => {
      caret.current = e.target.selectionStart;
      onChange(e.target.value);
    },
    onSelect: (e: { currentTarget: { selectionStart: number | null } }) => {
      caret.current = e.currentTarget.selectionStart;
    },
    className: cn('font-mono text-xs', className),
  };

  return (
    <div className="flex items-start gap-1.5">
      {multiline ? <Textarea {...common} rows={3} /> : <Input {...common} />}
      <VariableMenu
        variables={variables}
        onPick={insert}
        align="end"
        trigger={
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="shrink-0 text-sky-700"
            title={t('templateEditor.toolbar.insertVariable')}
            aria-label={t('templateEditor.toolbar.insertVariable')}
          >
            <Database className="size-4" />
          </Button>
        }
      />
    </div>
  );
}
