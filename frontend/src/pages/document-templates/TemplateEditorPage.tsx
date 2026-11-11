import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';
import { EditorContent, useEditor, useEditorState, type Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { toast } from 'sonner';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  ChevronDown,
  Database,
  Eye,
  History,
  Italic,
  LayoutTemplate,
  Loader2,
  Redo2,
  Save,
  Settings2,
  SquarePlus,
  Trash2,
  Underline,
  Undo2,
  Upload,
} from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { cn } from '@shared/lib/utils';
import { useAppSelector } from '@shared/store/hooks';
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from '@/shared/ui';
import { selectRole } from '@features/auth/model/selectors';
import {
  documentTemplateApi,
  templateActions,
  TemplateError,
  useDocumentTemplates,
  useDocumentTypeInfo,
  useTemplateAction,
} from '@entities/issued-document';
import {
  DEFAULT_MARGINS,
  DEFAULT_THEME,
  fieldKeyFor,
  fromEditorDoc,
  LAYOUT_BLOCK,
  normalizeField,
  pageSize,
  toEditorDoc,
  type Font,
  type LayoutBlock,
  type Orientation,
  type PageSize,
  type TemplateField,
  type TemplateLayout,
} from '@features/template-editor/model/layout';
import {
  INSERTABLE_BLOCKS,
  newBlock,
  type InsertableBlock,
} from '@features/template-editor/model/blocks';
import type { VariableInfo } from '@features/template-editor/model/variables';
import { BlockDialog, hasSettings } from '@features/template-editor/ui/BlockDialog';
import { PreviewContext, type PreviewSettings } from '@features/template-editor/ui/BlockPreview';
import { FieldDialog, type FieldDraft } from '@features/template-editor/ui/FieldDialog';
import { FieldNode, FieldsContext } from '@features/template-editor/ui/FieldNode';
import { LayoutBlockNode } from '@features/template-editor/ui/LayoutBlockNode';
import { VariableMenu } from '@features/template-editor/ui/VariableMenu';
import { VariableNode } from '@features/template-editor/ui/VariableNode';

const MANAGERS = ['director', 'super_admin'];
type BlockStyle = 'paragraph' | 'h1' | 'h2' | 'h3';
type PageFormat = `${PageSize}-${Orientation}`;
const PAGE_FORMATS: PageFormat[] = ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'];

function ToolButton({
  active,
  disabled,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keeps the editor's selection: a click on the toolbar must not blur the text.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-foreground/80 hover:bg-muted disabled:opacity-40 [&_svg]:size-4',
        active && 'bg-primary/10 text-primary',
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-6 w-px bg-border" />;

function Toolbar({
  editor,
  font,
  onFont,
  format,
  onFormat,
  blocks,
  onInsertBlock,
  variables,
  onInsertVariable,
  onInsertField,
}: {
  editor: Editor;
  font: Font;
  onFont: (font: Font) => void;
  format: PageFormat;
  onFormat: (format: PageFormat) => void;
  blocks: InsertableBlock[];
  onInsertBlock: (type: InsertableBlock) => void;
  variables: VariableInfo[];
  onInsertVariable: (path: string) => void;
  /** Absent for the types filled from the modules (bulletin): they take no typed fields. */
  onInsertField?: () => void;
}) {
  const { t } = useTranslation();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      style: (e.isActive('heading', { level: 1 })
        ? 'h1'
        : e.isActive('heading', { level: 2 })
          ? 'h2'
          : e.isActive('heading', { level: 3 })
            ? 'h3'
            : 'paragraph') as BlockStyle,
      align: (['center', 'right', 'justify'].find((a) => e.isActive({ textAlign: a })) ??
        'left') as string,
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const setStyle = (style: BlockStyle) => {
    const chain = editor.chain().focus();
    if (style === 'paragraph') chain.setParagraph().run();
    else chain.setHeading({ level: Number(style.slice(1)) as 1 | 2 | 3 }).run();
  };

  const align = (value: string) => editor.chain().focus().setTextAlign(value).run();

  return (
    <div className="flex flex-wrap items-center gap-1">
      <ToolButton
        label={t('templateEditor.toolbar.undo')}
        disabled={!state.canUndo}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.redo')}
        disabled={!state.canRedo}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 />
      </ToolButton>
      <Divider />
      <Select value={format} onValueChange={(v) => onFormat(v as PageFormat)}>
        <SelectTrigger className="h-8 w-36" title={t('templateEditor.toolbar.pageFormat')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_FORMATS.map((value) => (
            <SelectItem key={value} value={value}>
              {t(`templateEditor.toolbar.formats.${value}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={state.style} onValueChange={(v) => setStyle(v as BlockStyle)}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(['paragraph', 'h1', 'h2', 'h3'] as const).map((style) => (
            <SelectItem key={style} value={style}>
              {t(`templateEditor.toolbar.styles.${style}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={font} onValueChange={(v) => onFont(v as Font)}>
        <SelectTrigger className="h-8 w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="NotoSerif">{t('templateEditor.toolbar.fonts.serif')}</SelectItem>
          <SelectItem value="NotoSans">{t('templateEditor.toolbar.fonts.sans')}</SelectItem>
        </SelectContent>
      </Select>
      <Divider />
      <ToolButton
        label={t('templateEditor.toolbar.bold')}
        active={state.bold}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.italic')}
        active={state.italic}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.underline')}
        active={state.underline}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline />
      </ToolButton>
      <Divider />
      <ToolButton
        label={t('templateEditor.toolbar.alignLeft')}
        active={state.align === 'left'}
        onClick={() => align('left')}
      >
        <AlignLeft />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.alignCenter')}
        active={state.align === 'center'}
        onClick={() => align('center')}
      >
        <AlignCenter />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.alignRight')}
        active={state.align === 'right'}
        onClick={() => align('right')}
      >
        <AlignRight />
      </ToolButton>
      <ToolButton
        label={t('templateEditor.toolbar.justify')}
        active={state.align === 'justify'}
        onClick={() => align('justify')}
      >
        <AlignJustify />
      </ToolButton>
      <Divider />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5"
            onMouseDown={(e) => e.preventDefault()}
          >
            <LayoutTemplate className="size-4" />
            {t('templateEditor.toolbar.insertBlock')}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {blocks.map((type) => (
            <DropdownMenuItem key={type} onSelect={() => onInsertBlock(type)}>
              <div>
                <div className="text-sm">{t(`templateEditor.blocks.${type}.name`)}</div>
                <div className="text-xs text-muted-foreground">
                  {t(`templateEditor.blocks.${type}.help`)}
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <VariableMenu
        variables={variables}
        onPick={onInsertVariable}
        trigger={
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 border-sky-300 bg-sky-50 text-sky-900 hover:bg-sky-100"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Database className="size-4" />
            {t('templateEditor.toolbar.insertVariable')}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        }
      />
      {onInsertField && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onInsertField}
        >
          <SquarePlus className="size-4" />
          {t('templateEditor.toolbar.insertField')}
        </Button>
      )}
    </div>
  );
}

/** What the right-click landed on. */
type MenuTarget =
  | { kind: 'field'; key: string }
  | { kind: 'block'; pos: number }
  | { kind: 'text' };

export default function TemplateEditorPage() {
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
  const role = useAppSelector(selectRole);
  const canManage = !!role && MANAGERS.includes(role);

  const { data: templates = [], isLoading } = useDocumentTemplates(subSchoolId);
  const template = templates.find((tpl) => tpl.id === templateId);
  const base = template?.draftLayout as TemplateLayout | null | undefined;
  const { data: typeInfo } = useDocumentTypeInfo(template?.documentType);
  // Only free documents are typed by hand; a bulletin is filled from the modules.
  const takesFields = template?.documentType === 'free';

  const [fields, setFields] = useState<TemplateField[]>([]);
  const [font, setFont] = useState<Font>('NotoSerif');
  const [format, setFormat] = useState<PageFormat>('A4-portrait');
  const [revision, setRevision] = useState(0);
  const [savedJson, setSavedJson] = useState('');
  const [issues, setIssues] = useState<string[]>([]);
  const [fieldDialog, setFieldDialog] = useState<{ edit: TemplateField | null } | null>(null);
  const [blockDialog, setBlockDialog] = useState<{ pos: number; block: LayoutBlock } | null>(null);
  const [menu, setMenu] = useState<MenuTarget>({ kind: 'text' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const loadedFor = useRef<string | null>(null);

  const saveDraft = useTemplateAction(templateActions.saveDraft);
  const publish = useTemplateAction(templateActions.publish);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Only what the PDF engine prints: no lists, quotes, code, links or strike-through.
        blockquote: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
        link: false,
        heading: { levels: [1, 2, 3] },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      FieldNode,
      VariableNode,
      LayoutBlockNode,
    ],
    editable: canManage,
    onUpdate: () => setRevision((r) => r + 1),
    editorProps: {
      attributes: {
        class: 'template-page-text outline-none',
        spellcheck: 'true',
        lang: locale,
      },
    },
  });

  const [size, orientation] = format.split('-') as [PageSize, Orientation];
  const settings = useMemo(() => ({ font, size, orientation }), [font, size, orientation]);

  // Loads the draft once per template, then the editor owns the page.
  useEffect(() => {
    if (!editor || !base || !template || loadedFor.current === template.id) return;
    loadedFor.current = template.id;
    editor.commands.setContent(toEditorDoc(base), { emitUpdate: false });
    const loadedFields = (base.fields ?? []).map(normalizeField);
    const loaded = {
      font: (base.theme?.font ?? DEFAULT_THEME.font) as Font,
      size: (base.page?.size ?? 'A4') as PageSize,
      orientation: (base.page?.orientation ?? 'portrait') as Orientation,
    };
    setFields(loadedFields);
    setFont(loaded.font);
    setFormat(`${loaded.size}-${loaded.orientation}`);
    // The draft as the editor writes it back, so opening a template is not a change.
    setSavedJson(JSON.stringify(fromEditorDoc(base, editor.getJSON(), loadedFields, loaded)));
    setRevision((r) => r + 1);
  }, [editor, base, template]);

  useEffect(() => {
    editor?.setEditable(canManage);
  }, [editor, canManage]);

  const fieldMap = useMemo(() => new Map(fields.map((f) => [f.key, f])), [fields]);

  /** What would be saved now: recomputed on every change of the page, the fields or the settings. */
  const layout = useMemo(
    () => (editor && base ? fromEditorDoc(base, editor.getJSON(), fields, settings) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, base, fields, settings, revision],
  );
  const dirty = !!layout && JSON.stringify(layout) !== savedJson;
  const requiredCount = layout?.fields?.filter((f) => f.required).length ?? 0;

  const preview = useMemo<PreviewSettings>(
    () => ({
      // The engine fills `document.*` when it prints; previews show "APERÇU" and today's date.
      sample: {
        ...typeInfo?.sample,
        document: {
          number: 'APERÇU',
          issuedAt: new Date().toISOString().slice(0, 10),
          verifyUrl: '',
        },
      },
      primary: base?.theme?.primary ?? DEFAULT_THEME.primary,
      accent: base?.theme?.accent ?? DEFAULT_THEME.accent,
      fontSize: base?.theme?.fontSize ?? DEFAULT_THEME.fontSize,
      margins: base?.page?.margins ?? DEFAULT_MARGINS,
    }),
    [typeInfo, base],
  );
  const insertable = INSERTABLE_BLOCKS.filter((type) => typeInfo?.blocks.includes(type) ?? false);
  const variables = typeInfo?.variables ?? [];

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const showIssues = (error: unknown) => {
    if (error instanceof TemplateError) {
      const lines = Object.entries(error.details).flatMap(([path, messages]) =>
        messages.map((m) => `${path} — ${m}`),
      );
      setIssues(lines);
      toast.error(
        lines.length ? t('templatesPage.errors.invalid', { count: lines.length }) : error.message,
      );
    } else {
      toast.error(error instanceof Error ? error.message : t('templatesPage.errors.unknown'));
    }
  };

  const save = async (): Promise<boolean> => {
    if (!template || !layout) return false;
    try {
      await saveDraft.mutateAsync({ id: template.id, layout });
      setSavedJson(JSON.stringify(layout));
      setIssues([]);
      return true;
    } catch (error) {
      showIssues(error);
      return false;
    }
  };

  const handleSave = async () => {
    if (await save()) toast.success(t('templatesPage.draft.saved'));
  };

  const handlePublish = async () => {
    if (!template || !(await save())) return;
    try {
      await publish.mutateAsync({ id: template.id, note: null });
      toast.success(t('templatesPage.publish.done'));
    } catch (error) {
      showIssues(error);
    }
  };

  const handlePreview = async () => {
    if (!template || !layout) return;
    setPreviewing(true);
    try {
      const blob = await documentTemplateApi.preview(template.id, undefined, layout);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      toast.error(t('templatesPage.errors.preview'));
    } finally {
      setPreviewing(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  // ── Fields, data and blocks ────────────────────────────────────────────

  const submitField = (draft: FieldDraft) => {
    if (!editor || !fieldDialog) return;
    if (fieldDialog.edit) {
      const key = fieldDialog.edit.key;
      setFields((prev) => prev.map((f) => (f.key === key ? { ...draft, key } : f)));
    } else {
      const key = fieldKeyFor(draft.label, new Set(fields.map((f) => f.key)));
      setFields((prev) => [...prev, { ...draft, key }]);
      editor
        .chain()
        .focus()
        .insertContent([
          { type: 'field', attrs: { key } },
          { type: 'text', text: ' ' },
        ])
        .run();
    }
    setFieldDialog(null);
  };

  const insertVariable = (path: string) =>
    editor
      ?.chain()
      .focus()
      .insertContent([
        { type: 'variable', attrs: { path } },
        { type: 'text', text: ' ' },
      ])
      .run();

  const blockAt = (pos: number) => {
    const node = editor?.state.doc.nodeAt(pos);
    return node?.type.name === LAYOUT_BLOCK ? node : null;
  };

  /** The last top-level block that starts before `pos`. */
  const blockBefore = (pos: number): number | null => {
    let result: number | null = null;
    editor?.state.doc.forEach((node, offset) => {
      if (node.type.name === LAYOUT_BLOCK && offset < pos) result = offset;
    });
    return result;
  };

  const insertBlock = (type: InsertableBlock) => {
    if (!editor || !template) return;
    const block = newBlock(type, template.documentType);
    editor.chain().focus().insertContent({ type: LAYOUT_BLOCK, attrs: { block } }).run();
    // A block with settings opens them at once: its texts are only a starting point.
    const pos = blockBefore(editor.state.selection.from + 1);
    if (hasSettings(type) && pos !== null) setBlockDialog({ pos, block });
  };

  const selectNode = (pos: number) =>
    editor?.view.dispatch(
      editor.state.tr.setSelection(NodeSelection.create(editor.state.doc, pos)),
    );

  const updateBlock = (pos: number, block: LayoutBlock) => {
    if (!editor || !blockAt(pos)) return;
    editor.view.dispatch(editor.state.tr.setNodeMarkup(pos, undefined, { block }));
    setBlockDialog(null);
  };

  const moveBlock = (pos: number, direction: -1 | 1) => {
    const node = blockAt(pos);
    if (!editor || !node) return;
    const { doc } = editor.state;
    const sibling = doc.maybeChild(doc.resolve(pos).index(0) + direction);
    if (!sibling) return;
    const tr = editor.state.tr;
    let target: number;
    if (direction === -1) {
      target = pos - sibling.nodeSize;
      tr.delete(pos, pos + node.nodeSize).insert(target, node);
    } else {
      tr.insert(pos + node.nodeSize + sibling.nodeSize, node).delete(pos, pos + node.nodeSize);
      target = pos + sibling.nodeSize;
    }
    tr.setSelection(NodeSelection.create(tr.doc, target));
    editor.view.dispatch(tr.scrollIntoView());
  };

  const deleteBlock = (pos: number) => {
    const node = blockAt(pos);
    if (!editor || !node) return;
    editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
  };

  /** A required block (the grades table of a bulletin) cannot be removed when it is the last one. */
  const isLastRequired = (block: LayoutBlock) => {
    if (!typeInfo?.requiredBlocks.includes(block.type) || !layout) return false;
    return layout.blocks.filter((b) => b.type === block.type).length <= 1;
  };

  /** The position of the block whose drawing holds `element`, if any. */
  const blockPosOf = (element: HTMLElement): number | null => {
    if (!editor) return null;
    const dom = element.closest<HTMLElement>('[data-layout-block]');
    if (!dom) return null;
    let found: number | null = null;
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name !== LAYOUT_BLOCK) return;
      const nodeDom = editor.view.nodeDOM(offset);
      if (nodeDom instanceof HTMLElement && (nodeDom === dom || nodeDom.contains(dom))) {
        found = offset;
      }
    });
    return found;
  };

  /** Right-click: on a zone or a block, select it; elsewhere, put the cursor where the click was. */
  const onContextMenu = (e: MouseEvent) => {
    if (!editor) return;
    const target = e.target as HTMLElement;
    const blockPos = blockPosOf(target);
    if (blockPos !== null) {
      setMenu({ kind: 'block', pos: blockPos });
      selectNode(blockPos);
      return;
    }
    const chip = target.closest<HTMLElement>('[data-field-key], [data-variable-path]');
    if (chip) {
      setMenu(
        chip.dataset.fieldKey ? { kind: 'field', key: chip.dataset.fieldKey } : { kind: 'text' },
      );
      selectNode(editor.view.posAtDOM(chip, 0));
      return;
    }
    setMenu({ kind: 'text' });
    if (editor.state.selection.empty) {
      const at = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
      if (at) editor.commands.setTextSelection(at.pos);
    }
  };

  /** Double-click on a block opens its settings. */
  const onDoubleClick = (e: MouseEvent) => {
    if (!canManage) return;
    const pos = blockPosOf(e.target as HTMLElement);
    const block = pos === null ? null : (blockAt(pos)?.attrs.block as LayoutBlock | undefined);
    if (pos !== null && block && hasSettings(block.type)) setBlockDialog({ pos, block });
  };

  const back = () =>
    navigate({
      to: '/$locale/sub-schools/$subSchoolId/documents/templates',
      params: { locale, subSchoolId: subSchoolId ?? '' },
    });

  if (isLoading || !editor) {
    return (
      <div className="py-24 text-center">
        <Spinner />
      </div>
    );
  }
  if (!template || !base) {
    return (
      <p className="py-24 text-center text-sm text-muted-foreground">
        {t('templatesPage.errors.NOT_FOUND')}
      </p>
    );
  }

  const busy = saveDraft.isPending || publish.isPending;
  const page = pageSize({ size, orientation });
  const margins = base.page?.margins ?? DEFAULT_MARGINS;
  const menuBlock =
    menu.kind === 'block' ? (blockAt(menu.pos)?.attrs.block as LayoutBlock | undefined) : undefined;
  const menuIndex = menu.kind === 'block' ? editor.state.doc.resolve(menu.pos).index(0) : -1;

  return (
    <div className="flex min-h-screen flex-col bg-slate-200/60 dark:bg-slate-900">
      <header className="sticky top-0 z-30 border-b bg-background">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">{template.name}</h1>
            <p className="text-sm text-muted-foreground">
              {t(`templateEditor.types.${template.documentType}`, {
                defaultValue: template.documentType,
              })}
              {' · '}
              {template.activeVersion !== null
                ? t('templateEditor.header.published', { version: template.activeVersion })
                : t('templateEditor.header.neverPublished')}
              {takesFields && (
                <>
                  {' · '}
                  {t('templateEditor.header.fields', { count: layout?.fields?.length ?? 0 })}
                  {requiredCount > 0 &&
                    ` · ${t('templateEditor.header.required', { count: requiredCount })}`}
                </>
              )}
            </p>
          </div>
          {dirty && (
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {t('templateEditor.header.unsaved')}
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => (!dirty || window.confirm(t('templateEditor.header.leave'))) && back()}
          >
            {t('templateEditor.header.close')}
          </Button>
          <Button variant="ghost" asChild>
            <Link
              to="/$locale/sub-schools/$subSchoolId/documents/templates/$templateId"
              params={{ locale, subSchoolId: subSchoolId ?? '', templateId: template.id }}
            >
              <History className="mr-1.5 size-4" />
              {t('templateEditor.header.versions')}
            </Link>
          </Button>
          <Button variant="outline" onClick={handlePreview} disabled={previewing}>
            {previewing ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Eye className="mr-1.5 size-4" />
            )}
            {t('templateEditor.header.preview')}
          </Button>
          {canManage && (
            <>
              <Button variant="outline" onClick={handleSave} disabled={busy || !dirty}>
                <Save className="mr-1.5 size-4" />
                {t('templateEditor.header.save')}
              </Button>
              <Button onClick={handlePublish} disabled={busy}>
                <Upload className="mr-1.5 size-4" />
                {t('templatesPage.publish.button')}
              </Button>
            </>
          )}
        </div>
        {canManage && (
          <div className="border-t px-4 py-2 sm:px-6">
            <PreviewContext.Provider value={preview}>
              <Toolbar
                editor={editor}
                font={font}
                onFont={setFont}
                format={format}
                onFormat={setFormat}
                blocks={insertable}
                onInsertBlock={insertBlock}
                variables={variables}
                onInsertVariable={insertVariable}
                onInsertField={takesFields ? () => setFieldDialog({ edit: null }) : undefined}
              />
            </PreviewContext.Provider>
          </div>
        )}
      </header>

      {issues.length > 0 && (
        <ul className="mx-auto mt-4 w-full max-w-[210mm] space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-900 dark:bg-red-950/50 dark:text-red-100">
          {issues.map((issue) => (
            <li key={issue} className="font-mono">
              {issue}
            </li>
          ))}
        </ul>
      )}

      <main className="flex-1 overflow-x-auto py-8 pl-10 pr-4">
        <PreviewContext.Provider value={preview}>
          <FieldsContext.Provider value={fieldMap}>
            <ContextMenu>
              <ContextMenuTrigger asChild disabled={!canManage}>
                <div
                  onContextMenu={onContextMenu}
                  onDoubleClick={onDoubleClick}
                  style={{
                    width: `${page.width}mm`,
                    minHeight: `${page.height}mm`,
                    padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
                    fontSize: `${preview.fontSize}pt`,
                  }}
                  className={cn(
                    'mx-auto bg-white leading-[1.7] text-neutral-900 shadow-lg',
                    font === 'NotoSerif'
                      ? "font-['Noto_Serif',Georgia,'Times_New_Roman',serif]"
                      : "font-['Noto_Sans',Arial,sans-serif]",
                  )}
                >
                  <EditorContent editor={editor} />
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                {menu.kind === 'block' && menuBlock ? (
                  <>
                    {hasSettings(menuBlock.type) && (
                      <ContextMenuItem
                        onSelect={() => setBlockDialog({ pos: menu.pos, block: menuBlock })}
                      >
                        <Settings2 />
                        {t('templateEditor.menu.blockSettings')}
                      </ContextMenuItem>
                    )}
                    <ContextMenuItem
                      disabled={menuIndex <= 0}
                      onSelect={() => moveBlock(menu.pos, -1)}
                    >
                      <ArrowUp />
                      {t('templateEditor.menu.moveUp')}
                    </ContextMenuItem>
                    <ContextMenuItem
                      disabled={menuIndex >= editor.state.doc.childCount - 1}
                      onSelect={() => moveBlock(menu.pos, 1)}
                    >
                      <ArrowDown />
                      {t('templateEditor.menu.moveDown')}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      disabled={isLastRequired(menuBlock)}
                      onSelect={() => deleteBlock(menu.pos)}
                    >
                      <Trash2 />
                      {isLastRequired(menuBlock)
                        ? t('templateEditor.menu.requiredBlock')
                        : t('templateEditor.menu.deleteBlock')}
                    </ContextMenuItem>
                  </>
                ) : menu.kind === 'field' ? (
                  <>
                    <ContextMenuItem
                      onSelect={() => setFieldDialog({ edit: fieldMap.get(menu.key) ?? null })}
                      disabled={!fieldMap.get(menu.key)}
                    >
                      <Settings2 />
                      {t('templateEditor.menu.fieldSettings')}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      variant="destructive"
                      onSelect={() => editor.chain().focus().deleteSelection().run()}
                    >
                      <Trash2 />
                      {t('templateEditor.menu.deleteField')}
                    </ContextMenuItem>
                  </>
                ) : (
                  <>
                    {takesFields && (
                      <ContextMenuItem onSelect={() => setFieldDialog({ edit: null })}>
                        <SquarePlus />
                        {t('templateEditor.toolbar.insertField')}
                      </ContextMenuItem>
                    )}
                    <ContextMenuSub>
                      <ContextMenuSubTrigger>
                        <LayoutTemplate />
                        {t('templateEditor.toolbar.insertBlock')}
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        {insertable.map((type) => (
                          <ContextMenuItem key={type} onSelect={() => insertBlock(type)}>
                            {t(`templateEditor.blocks.${type}.name`)}
                          </ContextMenuItem>
                        ))}
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    {!editor.state.selection.empty && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          variant="destructive"
                          onSelect={() => editor.chain().focus().deleteSelection().run()}
                        >
                          <Trash2 />
                          {t('templateEditor.menu.deleteSelection')}
                        </ContextMenuItem>
                      </>
                    )}
                  </>
                )}
              </ContextMenuContent>
            </ContextMenu>
          </FieldsContext.Provider>

          {blockDialog && (
            <BlockDialog
              block={blockDialog.block}
              variables={variables}
              onClose={() => setBlockDialog(null)}
              onSubmit={(block) => updateBlock(blockDialog.pos, block)}
            />
          )}
        </PreviewContext.Provider>
      </main>

      {fieldDialog && (
        <FieldDialog
          initial={fieldDialog.edit}
          onClose={() => setFieldDialog(null)}
          onSubmit={submitField}
        />
      )}

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-5xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t('templateEditor.header.preview')}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <iframe
              title={t('templateEditor.header.preview')}
              src={previewUrl}
              className="h-[75vh] w-full rounded border"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
