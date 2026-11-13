import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import type { JSONContent } from '@tiptap/react';
import { toast } from 'sonner';
import { ArrowRight, FileText, Loader2 } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { cn } from '@shared/lib/utils';
import { Button, Spinner } from '@/shared/ui';
import {
  downloadIssuedDocument,
  IssuedDocumentError,
  useDocumentTemplates,
  useDocumentTypeInfo,
  useIssueFreeDocument,
  useTemplateVersions,
} from '@entities/issued-document';
import {
  DEFAULT_MARGINS,
  DEFAULT_THEME,
  normalizeField,
  pageSize,
  type TemplateField,
  type TemplateLayout,
} from '@features/template-editor/model/layout';
import { variableLabelKey } from '@features/template-editor/model/variables';
import { BlockPreview, PreviewContext } from '@features/template-editor/ui/BlockPreview';
import { RichTextView } from '@features/template-editor/ui/RichTextView';

/** `2012-04-03` → `03/04/2012`, as the PDF prints it. */
const showDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

/** The order fields appear in the text, each once: "next field" follows the reading order. */
function fieldOrder(content: JSONContent[]): string[] {
  const keys: string[] = [];
  for (const node of content) {
    for (const child of node.content ?? []) {
      const key = child.type === 'field' ? String(child.attrs?.key) : null;
      if (key && !keys.includes(key)) keys.push(key);
    }
  }
  return keys;
}

/**
 * Issues a free document: the published template is shown as a page, the
 * yellow zones are filled in place, and "Générer le PDF" numbers, stores and
 * downloads the document.
 */
export default function IssueDocumentPage() {
  const {
    subSchoolId,
    templateId,
    locale = 'fr',
  } = useParams({ strict: false }) as {
    subSchoolId?: string;
    templateId?: string;
    locale?: string;
  };
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { data: templates = [], isLoading } = useDocumentTemplates(subSchoolId);
  const { data: typeInfo } = useDocumentTypeInfo('free');
  const template = templates.find((tpl) => tpl.id === templateId);
  const { data: versions = [], isLoading: versionsLoading } = useTemplateVersions(template?.id);
  const version = versions.find((v) => v.version === template?.activeVersion);
  const layout = version?.layout as TemplateLayout | undefined;

  const fields = useMemo(
    () => new Map((layout?.fields ?? []).map((f) => [f.key, normalizeField(f)] as const)),
    [layout],
  );
  /** Every paragraph of the page, all text blocks together: the reading order of the fields. */
  const content = useMemo(
    () =>
      (layout?.blocks ?? []).flatMap((block) =>
        block.type === 'richText' ? (block.content as JSONContent[]) : [],
      ),
    [layout],
  );
  const order = useMemo(
    () => fieldOrder(content).filter((key) => fields.has(key)),
    [content, fields],
  );

  const [values, setValues] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const issue = useIssueFreeDocument();

  useEffect(() => {
    inputRef.current?.focus();
  }, [active]);

  const filled = (key: string) => (values[key] ?? '').trim() !== '';
  const filledCount = order.filter(filled).length;
  const missingRequired = order.filter((key) => fields.get(key)!.required && !filled(key));
  const percent = order.length ? Math.round((filledCount / order.length) * 100) : 100;

  /** The next field to fill after the current one: required ones first, then the others. */
  const goNext = () => {
    const start = active ? order.indexOf(active) + 1 : 0;
    const rotated = [...order.slice(start), ...order.slice(0, start)];
    const next =
      rotated.find((key) => fields.get(key)!.required && !filled(key)) ??
      rotated.find((key) => !filled(key));
    setActive(next ?? null);
  };

  const backToDocuments = () =>
    navigate({
      to: '/$locale/sub-schools/$subSchoolId/documents',
      params: { locale, subSchoolId: subSchoolId ?? '' },
    });

  const generate = () => {
    if (!subSchoolId || !template || missingRequired.length) return;
    const typed = Object.fromEntries(
      Object.entries(values)
        .map(([key, value]) => [key, value.trim()])
        .filter(([, value]) => value !== ''),
    );
    issue.mutate(
      { subSchoolId, templateId: template.id, fields: typed },
      {
        onSuccess: async (doc) => {
          toast.success(t('issuePage.done', { number: doc.number }));
          try {
            await downloadIssuedDocument(doc);
          } catch {
            toast.error(t('documentsPage.errors.unknown'));
          }
          backToDocuments();
        },
        onError: (error) => {
          if (error instanceof IssuedDocumentError && error.code === 'INVALID_FIELDS') {
            setErrors(
              Object.fromEntries(
                Object.entries(error.details).map(([key, messages]) => [key, messages.join(' ')]),
              ),
            );
            toast.error(t('issuePage.invalid'));
          } else {
            toast.error(error.message || t('documentsPage.errors.unknown'));
          }
        },
      },
    );
  };

  /**
   * The data the server adds when the document is issued (the school, the
   * number, the date) is not known yet: each one shows its label.
   */
  const placeholders = useMemo(() => {
    const data: Record<string, Record<string, string>> = {};
    for (const { path } of typeInfo?.variables ?? []) {
      const [group, key] = path.split('.');
      if (!group || !key) continue;
      data[group] = {
        ...data[group],
        [key]: `‹${t(variableLabelKey(path), { defaultValue: path })}›`,
      };
    }
    return data;
  }, [typeInfo, t]);

  const renderVariable = (path: string, style: CSSProperties) => (
    <span style={style} className="rounded bg-sky-50 px-1 font-sans text-[0.9em] text-sky-800">
      {t(variableLabelKey(path), { defaultValue: path })}
    </span>
  );

  const renderField = (key: string, style: CSSProperties) => {
    const field = fields.get(key) as TemplateField | undefined;
    if (!field) return null;
    const value = values[key] ?? '';
    const error = errors[key];

    if (active === key) {
      const common = {
        ref: inputRef,
        value,
        onChange: (e: { target: { value: string } }) => {
          setValues((prev) => ({ ...prev, [key]: e.target.value }));
          setErrors((prev) => ({ ...prev, [key]: '' }));
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Escape') setActive(null);
          if ((e.key === 'Enter' && field.type !== 'longText') || e.key === 'Tab') {
            e.preventDefault();
            goNext();
          }
        },
        className:
          'rounded-md border-2 border-blue-500 bg-white px-2 py-1 font-sans text-[0.95em] text-neutral-900 shadow-sm outline-none ring-4 ring-blue-500/15',
      };
      return (
        <span className="relative mx-0.5 inline-flex flex-col align-baseline">
          <span className="absolute -top-5 left-0 whitespace-nowrap font-sans text-xs font-medium text-blue-700">
            {field.label}
            {field.required && ` · ${t('issuePage.required')}`}
          </span>
          {field.type === 'longText' ? (
            <textarea {...common} rows={3} className={cn(common.className, 'min-w-[22rem]')} />
          ) : (
            <input
              {...common}
              type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'}
              className={cn(common.className, field.type === 'date' ? 'w-44' : 'min-w-[14rem]')}
            />
          )}
        </span>
      );
    }

    const shown = value.trim()
      ? field.type === 'date'
        ? showDate(value.trim())
        : value
      : field.label;
    return (
      <button
        type="button"
        onClick={() => setActive(key)}
        title={error || field.label}
        style={value.trim() ? style : undefined}
        className={cn(
          'mx-0.5 rounded px-1.5 py-px font-sans text-[0.92em] leading-snug',
          value.trim()
            ? 'bg-amber-100 text-neutral-900'
            : field.required
              ? 'border border-dashed border-amber-500 bg-amber-50 text-amber-800'
              : 'border border-dashed border-amber-300 bg-amber-50/60 text-amber-700',
          error && 'border-red-500 bg-red-50 text-red-800',
        )}
      >
        {shown}
      </button>
    );
  };

  if (isLoading || versionsLoading) {
    return (
      <div className="py-24 text-center">
        <Spinner />
      </div>
    );
  }
  if (!template || template.activeVersion === null || !layout) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">{t('issuePage.notPublished')}</p>
        <Button variant="outline" onClick={backToDocuments}>
          {t('documentsPage.title')}
        </Button>
      </div>
    );
  }

  const serif = layout.theme?.font === 'NotoSerif';
  const page = pageSize(layout.page ?? {});
  const margins = layout.page?.margins ?? DEFAULT_MARGINS;
  const fontSize = layout.theme?.fontSize ?? DEFAULT_THEME.fontSize;

  return (
    <div className="flex min-h-screen flex-col bg-slate-200/60 dark:bg-slate-900">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">{t('issuePage.title')}</h1>
            <p className="truncate text-sm text-muted-foreground">
              {template.name} · v{template.activeVersion}
            </p>
          </div>
          <Button variant="outline" onClick={backToDocuments}>
            {t('documentsPage.revokeDialog.cancel')}
          </Button>
          {missingRequired.length > 0 && (
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {t('issuePage.remaining', { count: missingRequired.length })}
            </span>
          )}
          <Button onClick={generate} disabled={missingRequired.length > 0 || issue.isPending}>
            {issue.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <FileText className="mr-1.5 size-4" />
            )}
            {t('issuePage.generate')}
          </Button>
        </div>
        {order.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 border-t px-4 py-3 sm:px-6">
            <div className="w-full max-w-md space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-medium">
                  {t('issuePage.progress', { filled: filledCount, total: order.length })}
                </span>
                <span className="text-muted-foreground">{percent} %</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
            <Button variant="outline" onClick={goNext} disabled={filledCount === order.length}>
              {t('issuePage.next')}
              <ArrowRight className="ml-1.5 size-4" />
            </Button>
            <span className="text-sm text-muted-foreground">{t('issuePage.hint')}</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-x-auto px-4 py-8">
        <div
          style={{
            width: `${page.width}mm`,
            minHeight: `${page.height}mm`,
            padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
            fontSize: `${fontSize}pt`,
          }}
          className={cn(
            'mx-auto bg-white leading-[2] text-neutral-900 shadow-lg',
            serif
              ? "font-['Noto_Serif',Georgia,'Times_New_Roman',serif]"
              : "font-['Noto_Sans',Arial,sans-serif]",
          )}
        >
          <PreviewContext.Provider
            value={{
              sample: placeholders,
              primary: layout.theme?.primary ?? DEFAULT_THEME.primary,
              accent: layout.theme?.accent ?? DEFAULT_THEME.accent,
              fontSize,
              margins,
            }}
          >
            {layout.blocks.map((block, i) =>
              block.type === 'richText' ? (
                <RichTextView
                  key={i}
                  content={block.content as JSONContent[]}
                  renderField={renderField}
                  renderVariable={renderVariable}
                />
              ) : (
                <div key={i} className="leading-normal">
                  <BlockPreview block={block} />
                </div>
              ),
            )}
          </PreviewContext.Provider>
        </div>
      </main>
    </div>
  );
}
