import { useMemo, useState, type DragEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Copy,
  FilePlus2,
  FileText,
  Folder,
  FolderPlus,
  GripVertical,
  PenLine,
  Plus,
  Search,
  TextCursorInput,
  Trash2,
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
  ContextMenuTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
} from '@/shared/ui';
import { selectRole } from '@features/auth/model/selectors';
import { blankBulletinLayout } from '@features/template-editor/model/blocks';
import {
  templateActions,
  TemplateError,
  useTemplateAction,
  useTemplateLibrary,
  useTemplateStarters,
  type DocumentFolder,
  type DocumentTemplate,
} from '@entities/issued-document';

const MANAGERS = ['director', 'super_admin'];
const COLUMNS = 'grid grid-cols-[minmax(0,1fr)_5rem_7rem_5rem_8rem] items-center gap-3';

type Filter = 'all' | 'published' | 'drafts';
type Dragged = { kind: 'folder' | 'template'; id: string };
type Row =
  | { kind: 'folder'; folder: DocumentFolder; depth: number; count: number }
  | { kind: 'template'; template: DocumentTemplate; depth: number };

/** A blank free document: a centred title and an empty line, in the serif font of official papers. */
const blankLayout = (name: string) => ({
  format: 1,
  page: {},
  theme: { font: 'NotoSerif', fontSize: 11 },
  fields: [],
  blocks: [
    {
      type: 'richText',
      content: [
        {
          type: 'heading',
          attrs: { level: 1, textAlign: 'center' },
          content: [{ type: 'text', text: name.toUpperCase() }],
        },
        { type: 'paragraph' },
      ],
    },
  ],
});

const fieldCount = (template: DocumentTemplate) =>
  Array.isArray((template.draftLayout as { fields?: unknown[] } | null)?.fields)
    ? (template.draftLayout as { fields: unknown[] }).fields.length
    : 0;

const isPublished = (template: DocumentTemplate) => template.activeVersion !== null;

const normalize = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type NewTemplateChoice = {
  name: string;
  documentType: 'free' | 'bulletin';
  /** A ready-made design to copy; absent to start from an empty page. */
  starter?: string;
};

/**
 * A new template: its name and its kind. A free document is written by hand
 * and filled at issue time; a bulletin prints the grades of the modules. A
 * school has one bulletin: when it exists, the dialog says so.
 */
function NewTemplateDialog({
  existingBulletin,
  onClose,
  onSubmit,
}: {
  existingBulletin: DocumentTemplate | null;
  onClose: () => void;
  onSubmit: (choice: NewTemplateChoice) => void;
}) {
  const { t } = useTranslation();
  const { data: starters = [] } = useTemplateStarters();
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState<'free' | 'bulletin'>('free');
  const [start, setStart] = useState('blank');
  const bulletinStarters = starters.filter((s) => s.documentType === 'bulletin');
  const blocked = documentType === 'bulletin' && !!existingBulletin;

  const kinds = [
    {
      value: 'free' as const,
      title: t('templatesPage.newTemplate.free'),
      help: t('templatesPage.newTemplate.freeHelp'),
    },
    {
      value: 'bulletin' as const,
      title: t('templatesPage.newTemplate.bulletin'),
      help: t('templatesPage.newTemplate.bulletinHelp'),
    },
  ];

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || blocked) return;
            onSubmit({
              name: name.trim(),
              documentType,
              starter: documentType === 'bulletin' && start !== 'blank' ? start : undefined,
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>{t('templatesPage.library.newTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="new-template-name">{t('templatesPage.library.name')}</Label>
            <Input
              id="new-template-name"
              autoFocus
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t('templatesPage.newTemplate.kind')}</Label>
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
              {kinds.map((kind) => (
                <button
                  key={kind.value}
                  type="button"
                  role="radio"
                  aria-checked={documentType === kind.value}
                  onClick={() => setDocumentType(kind.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                    documentType === kind.value &&
                      'border-primary bg-primary/5 ring-1 ring-primary',
                  )}
                >
                  <div className="text-sm font-medium">{kind.title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{kind.help}</div>
                </button>
              ))}
            </div>
          </div>
          {documentType === 'bulletin' &&
            (existingBulletin ? (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                {t('templatesPage.newTemplate.bulletinExists', { name: existingBulletin.name })}
              </p>
            ) : (
              <div className="space-y-1.5">
                <Label>{t('templatesPage.newTemplate.start')}</Label>
                <div className="space-y-1.5">
                  {[
                    { value: 'blank', label: t('templatesPage.newTemplate.blank') },
                    ...bulletinStarters.map((s) => ({
                      value: s.key,
                      label: t('templatesPage.newTemplate.fromStarter', { name: s.name }),
                    })),
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="bulletin-start"
                        className="accent-primary"
                        checked={start === option.value}
                        onChange={() => setStart(option.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim() || blocked}>
              {t('templatesPage.create.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A dialog asking for one name: new folder, new template, rename, duplicate. */
function NameDialog({
  open,
  title,
  initial,
  submit,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initial: string;
  submit: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(initial);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onSubmit(name.trim());
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="library-name">{t('templatesPage.library.name')}</Label>
            <Input
              id="library-name"
              autoFocus
              value={name}
              maxLength={120}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DocumentTemplatesPage() {
  const { subSchoolId, locale = 'fr' } = useParams({ strict: false }) as {
    subSchoolId?: string;
    locale?: string;
  };
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = useAppSelector(selectRole);
  const canManage = !!role && MANAGERS.includes(role);

  const { data, isLoading, isError, error, refetch } = useTemplateLibrary(subSchoolId);
  const folders = useMemo(() => data?.folders ?? [], [data]);
  const templates = useMemo(() => data?.templates ?? [], [data]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [dragged, setDragged] = useState<Dragged | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [dialog, setDialog] = useState<ReactNode>(null);

  const create = useTemplateAction(templateActions.create);
  const createFolder = useTemplateAction(templateActions.createFolder);
  const rename = useTemplateAction(templateActions.rename);
  const renameFolder = useTemplateAction(templateActions.renameFolder);
  const move = useTemplateAction(templateActions.move);
  const moveFolder = useTemplateAction(templateActions.moveFolder);
  const duplicate = useTemplateAction(templateActions.duplicate);
  const remove = useTemplateAction(templateActions.remove);
  const deleteFolder = useTemplateAction(templateActions.deleteFolder);

  const fail = (err: unknown) =>
    toast.error(
      err instanceof TemplateError &&
        ['CONFLICT', 'NOT_FOUND', 'FORBIDDEN', 'NOT_CONFIGURED'].includes(err.code)
        ? t(`templatesPage.library.errors.${err.code}`)
        : err instanceof Error
          ? err.message
          : t('templatesPage.errors.unknown'),
    );
  const close = () => setDialog(null);

  const counts = {
    all: templates.length,
    published: templates.filter(isPublished).length,
    drafts: templates.filter((tpl) => !isPublished(tpl)).length,
  };

  const visible = useMemo(() => {
    const query = normalize(search.trim());
    return templates.filter(
      (tpl) =>
        (filter === 'all' || (filter === 'published') === isPublished(tpl)) &&
        (!query || normalize(tpl.name).includes(query)),
    );
  }, [templates, filter, search]);
  const narrowed = filter !== 'all' || search.trim() !== '';

  /** The tree, flattened in display order: each folder, then its sub-folders, then its templates. */
  const rows = useMemo(() => {
    const childrenOf = (parentId: string | null) =>
      folders.filter((f) => f.parentId === parentId).sort((a, b) => a.position - b.position);
    const templatesIn = (folderId: string | null) =>
      visible.filter((tpl) => tpl.folderId === folderId).sort((a, b) => a.position - b.position);
    const countIn = (folderId: string): number =>
      templatesIn(folderId).length + childrenOf(folderId).reduce((n, f) => n + countIn(f.id), 0);

    const result: Row[] = [];
    const walk = (parentId: string | null, depth: number) => {
      for (const folder of childrenOf(parentId)) {
        const count = countIn(folder.id);
        // While searching or filtering, folders with nothing to show are hidden.
        if (narrowed && count === 0) continue;
        result.push({ kind: 'folder', folder, depth, count });
        if (narrowed || !closed.has(folder.id)) walk(folder.id, depth + 1);
      }
      for (const template of templatesIn(parentId)) {
        result.push({ kind: 'template', template, depth });
      }
    };
    walk(null, 0);
    return result;
  }, [folders, visible, closed, narrowed]);

  // ── Actions ────────────────────────────────────────────────────────────

  const openEditor = (template: DocumentTemplate) =>
    navigate({
      to: '/$locale/sub-schools/$subSchoolId/documents/templates/$templateId/edit',
      params: { locale, subSchoolId: subSchoolId ?? '', templateId: template.id },
    });

  const askNewTemplate = (folderId: string | null) =>
    setDialog(
      <NewTemplateDialog
        // Templates of the whole group; a bulletin for one sub-school is set elsewhere.
        existingBulletin={
          templates.find((tpl) => tpl.documentType === 'bulletin' && tpl.subSchoolId === null) ??
          null
        }
        onClose={close}
        onSubmit={({ name, documentType, starter }) =>
          subSchoolId &&
          create.mutate(
            [
              subSchoolId,
              {
                documentType,
                name,
                subSchoolId: null,
                folderId,
                ...(starter
                  ? { starter }
                  : {
                      layout:
                        documentType === 'bulletin' ? blankBulletinLayout() : blankLayout(name),
                    }),
              },
            ],
            {
              onSuccess: (tpl) => {
                close();
                if (folderId)
                  setClosed((prev) => new Set([...prev].filter((id) => id !== folderId)));
                openEditor(tpl as DocumentTemplate);
              },
              onError: fail,
            },
          )
        }
      />,
    );

  const askNewFolder = (parentId: string | null) =>
    setDialog(
      <NameDialog
        open
        title={t('templatesPage.library.newFolder')}
        initial=""
        submit={t('templatesPage.create.submit')}
        onClose={close}
        onSubmit={(name) =>
          subSchoolId &&
          createFolder.mutate({ subSchoolId, name, parentId }, { onSuccess: close, onError: fail })
        }
      />,
    );

  const askRename = (row: Row) =>
    setDialog(
      <NameDialog
        open
        title={t('templatesPage.library.rename')}
        initial={row.kind === 'folder' ? row.folder.name : row.template.name}
        submit={t('templatesPage.library.save')}
        onClose={close}
        onSubmit={(name) =>
          row.kind === 'folder'
            ? renameFolder.mutate({ id: row.folder.id, name }, { onSuccess: close, onError: fail })
            : rename.mutate({ id: row.template.id, name }, { onSuccess: close, onError: fail })
        }
      />,
    );

  const askDuplicate = (template: DocumentTemplate) =>
    setDialog(
      <NameDialog
        open
        title={t('templatesPage.library.duplicate')}
        initial={t('templatesPage.library.copyOf', { name: template.name })}
        submit={t('templatesPage.library.duplicate')}
        onClose={close}
        onSubmit={(name) =>
          duplicate.mutate({ id: template.id, name }, { onSuccess: close, onError: fail })
        }
      />,
    );

  /** A folder and all its sub-folders: where it cannot be moved. */
  const selfAndBelow = (folderId: string) => {
    const found = new Set<string>();
    const stack = [folderId];
    while (stack.length) {
      const id = stack.pop()!;
      found.add(id);
      stack.push(...folders.filter((f) => f.parentId === id).map((f) => f.id));
    }
    return found;
  };

  /** Folders a row may move into: not itself, not one of its own sub-folders. */
  const destinations = (row: Row) => {
    const blocked = row.kind === 'folder' ? selfAndBelow(row.folder.id) : new Set<string>();
    const list: Array<{ id: string | null; name: string; depth: number }> = [
      { id: null, name: t('templatesPage.library.root'), depth: 0 },
    ];
    const walk = (parentId: string | null, depth: number) => {
      for (const f of folders
        .filter((f) => f.parentId === parentId)
        .sort((a, b) => a.position - b.position)) {
        if (blocked.has(f.id)) continue;
        list.push({ id: f.id, name: f.name, depth });
        walk(f.id, depth + 1);
      }
    };
    walk(null, 1);
    return list;
  };

  const moveInto = (item: Dragged, folderId: string | null, index = 10_000) => {
    if (item.kind === 'folder') {
      moveFolder.mutate({ id: item.id, parentId: folderId, index }, { onError: fail });
    } else {
      move.mutate({ id: item.id, folderId, index }, { onError: fail });
    }
  };

  const askMove = (row: Row) =>
    setDialog(
      <Dialog open onOpenChange={(next) => !next && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templatesPage.library.moveTo')}</DialogTitle>
            <DialogDescription>
              {row.kind === 'folder' ? row.folder.name : row.template.name}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto rounded-lg border">
            {destinations(row).map((dest) => (
              <button
                key={dest.id ?? 'root'}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                style={{ paddingLeft: `${0.75 + dest.depth * 1.25}rem` }}
                onClick={() => {
                  moveInto(
                    {
                      kind: row.kind,
                      id: row.kind === 'folder' ? row.folder.id : row.template.id,
                    },
                    dest.id,
                  );
                  close();
                }}
              >
                <Folder className="size-4 text-amber-500" />
                {dest.name}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>,
    );

  const askDelete = (row: Row) => {
    const published = row.kind === 'template' && isPublished(row.template);
    setDialog(
      <Dialog open onOpenChange={(next) => !next && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('templatesPage.library.delete')}</DialogTitle>
            <DialogDescription>
              {row.kind === 'folder'
                ? t('templatesPage.library.deleteFolderText', { name: row.folder.name })
                : published
                  ? t('templatesPage.library.archiveText', { name: row.template.name })
                  : t('templatesPage.library.deleteText', { name: row.template.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              {t('documentsPage.revokeDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                row.kind === 'folder'
                  ? deleteFolder.mutate({ id: row.folder.id }, { onSuccess: close, onError: fail })
                  : remove.mutate(
                      { id: row.template.id },
                      {
                        onSuccess: (result) => {
                          close();
                          toast.success(
                            (result as { result: string }).result === 'archived'
                              ? t('templatesPage.library.archived')
                              : t('templatesPage.library.deleted'),
                          );
                        },
                        onError: fail,
                      },
                    )
              }
            >
              {published ? t('templatesPage.archive') : t('templatesPage.library.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
  };

  // ── Drag and drop ──────────────────────────────────────────────────────

  const rowKey = (row: Row) =>
    row.kind === 'folder' ? `f:${row.folder.id}` : `t:${row.template.id}`;

  /** Where a dragged item lands on this row: inside a folder, or just before a template. */
  const dropOn = (row: Row): { folderId: string | null; index: number } | null => {
    if (!dragged) return null;
    if (row.kind === 'folder') {
      if (dragged.kind === 'folder' && selfAndBelow(dragged.id).has(row.folder.id)) return null;
      return { folderId: row.folder.id, index: 10_000 };
    }
    if (dragged.kind === 'folder') return null;
    const siblings = templates
      .filter((tpl) => tpl.folderId === row.template.folderId && tpl.id !== dragged.id)
      .sort((a, b) => a.position - b.position);
    return {
      folderId: row.template.folderId,
      index: siblings.findIndex((tpl) => tpl.id === row.template.id),
    };
  };

  const dragProps = (row: Row) =>
    canManage && !narrowed
      ? {
          draggable: true,
          onDragStart: (e: DragEvent) => {
            e.dataTransfer.effectAllowed = 'move';
            setDragged(
              row.kind === 'folder'
                ? { kind: 'folder', id: row.folder.id }
                : { kind: 'template', id: row.template.id },
            );
          },
          onDragEnd: () => {
            setDragged(null);
            setDropTarget(null);
          },
          onDragOver: (e: DragEvent) => {
            if (dropOn(row)) {
              e.preventDefault();
              setDropTarget(rowKey(row));
            }
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            const target = dropOn(row);
            if (target && dragged) moveInto(dragged, target.folderId, target.index);
            setDragged(null);
            setDropTarget(null);
          },
        }
      : {};

  // ── Rendering ──────────────────────────────────────────────────────────

  const menu = (row: Row) => {
    const here = row.kind === 'folder' ? row.folder.id : row.template.folderId;
    return (
      <ContextMenuContent>
        {row.kind === 'template' && (
          <>
            <ContextMenuItem variant="primary" onSelect={() => openEditor(row.template)}>
              <PenLine />
              {t('templatesPage.library.openEditor')}
            </ContextMenuItem>
            {row.template.documentType === 'free' && isPublished(row.template) && (
              <ContextMenuItem
                onSelect={() =>
                  navigate({
                    to: '/$locale/sub-schools/$subSchoolId/documents/new/$templateId',
                    params: { locale, subSchoolId: subSchoolId ?? '', templateId: row.template.id },
                  })
                }
              >
                <FileText />
                {t('templatesPage.library.issue')}
              </ContextMenuItem>
            )}
            <ContextMenuSeparator />
          </>
        )}
        {canManage && (
          <>
            <ContextMenuItem onSelect={() => askNewTemplate(here)}>
              <FilePlus2 />
              {t('templatesPage.library.newTemplateHere')}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => askNewFolder(here)}>
              <FolderPlus />
              {t('templatesPage.library.newFolderHere')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            {row.kind === 'template' && (
              <ContextMenuItem onSelect={() => askDuplicate(row.template)}>
                <Copy />
                {t('templatesPage.library.duplicate')}
              </ContextMenuItem>
            )}
            <ContextMenuItem onSelect={() => askRename(row)}>
              <TextCursorInput />
              {t('templatesPage.library.rename')}
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => askMove(row)}>
              <ArrowRight />
              {t('templatesPage.library.moveTo')}
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive" onSelect={() => askDelete(row)}>
              <Trash2 />
              {t('templatesPage.library.delete')}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    );
  };

  const indent = (depth: number) => ({ paddingLeft: `${0.75 + depth * 1.75}rem` });

  const renderRow = (row: Row) => {
    const key = rowKey(row);
    const target = dropTarget === key;
    const grip = canManage && !narrowed && (
      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/60" />
    );
    if (row.kind === 'folder') {
      const open = narrowed || !closed.has(row.folder.id);
      return (
        <ContextMenu key={key}>
          <ContextMenuTrigger asChild>
            <div
              {...dragProps(row)}
              className={cn(
                COLUMNS,
                'min-h-14 border-b py-2 pr-4 hover:bg-muted/40',
                target && 'bg-primary/10 ring-2 ring-primary ring-inset',
              )}
              onClick={() =>
                setClosed((prev) => {
                  const next = new Set(prev);
                  if (next.has(row.folder.id)) next.delete(row.folder.id);
                  else next.add(row.folder.id);
                  return next;
                })
              }
            >
              <div className="flex min-w-0 items-center gap-2" style={indent(row.depth)}>
                {grip}
                {open ? (
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                )}
                <Folder className="size-5 shrink-0 fill-amber-300 text-amber-500" />
                <span className="truncate font-medium">{row.folder.name}</span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {t('templatesPage.library.models', { count: row.count })}
                </span>
              </div>
              <span className="text-muted-foreground">—</span>
              <span />
              <span />
              <span />
            </div>
          </ContextMenuTrigger>
          {menu(row)}
        </ContextMenu>
      );
    }
    const tpl = row.template;
    const version = tpl.activeVersion;
    return (
      <ContextMenu key={key}>
        <ContextMenuTrigger asChild>
          <div
            {...dragProps(row)}
            onDoubleClick={() => openEditor(tpl)}
            className={cn(
              COLUMNS,
              'min-h-14 border-b py-2 pr-4 hover:bg-muted/40 data-[state=open]:bg-primary/5 data-[state=open]:shadow-[inset_3px_0_0_var(--color-primary)]',
              target && 'shadow-[inset_0_2px_0_var(--color-primary)]',
            )}
          >
            <div className="flex min-w-0 items-center gap-2" style={indent(row.depth + 1)}>
              {grip}
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{tpl.name}</span>
              {tpl.documentType === 'bulletin' && (
                <span className="shrink-0 rounded bg-sky-50 px-1.5 py-px text-[11px] font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                  {t('templateEditor.types.bulletin')}
                </span>
              )}
            </div>
            <span className="tabular-nums">
              {tpl.documentType === 'free' ? fieldCount(tpl) : '—'}
            </span>
            <span>
              {isPublished(tpl) ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                  {t('templatesPage.library.published')}
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {t('templatesPage.library.draft')}
                </span>
              )}
            </span>
            <span className="tabular-nums">{version !== null ? `v${version}` : '—'}</span>
            <span className="text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
                new Date(tpl.updatedAt),
              )}
            </span>
          </div>
        </ContextMenuTrigger>
        {menu(row)}
      </ContextMenu>
    );
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('templatesPage.title')}</h1>
            <p className="text-muted-foreground">{t('templatesPage.library.subtitle')}</p>
            {!canManage && (
              <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                {t('templatesPage.library.readOnly')}
              </p>
            )}
          </div>
          {canManage && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => askNewFolder(null)}>
                <FolderPlus className="mr-2 size-4" />
                {t('templatesPage.library.newFolder')}
              </Button>
              <Button onClick={() => askNewTemplate(null)}>
                <Plus className="mr-2 size-4" />
                {t('templatesPage.library.newTemplate')}
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('templatesPage.library.search')}
              className="bg-background pl-9"
            />
          </div>
          <div className="flex rounded-lg bg-muted p-1">
            {(['all', 'published', 'drafts'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition',
                  filter === key ? 'bg-background shadow-sm' : 'text-muted-foreground',
                )}
              >
                {t(`templatesPage.library.filters.${key}`)}{' '}
                <span className="text-muted-foreground">{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="min-w-[44rem]">
            <div
              className={cn(
                COLUMNS,
                'border-b bg-muted/40 py-3 pr-4 pl-3 text-xs font-medium tracking-wider text-muted-foreground uppercase',
              )}
            >
              <span>{t('templatesPage.library.columns.name')}</span>
              <span>{t('templatesPage.library.columns.fields')}</span>
              <span>{t('templatesPage.library.columns.status')}</span>
              <span>{t('templatesPage.library.columns.version')}</span>
              <span>{t('templatesPage.library.columns.modified')}</span>
            </div>
            {isLoading ? (
              <div className="py-16 text-center">
                <Spinner />
              </div>
            ) : isError ? (
              <div className="space-y-3 py-12 text-center text-sm">
                <p className="text-destructive">
                  {t('documentsPage.loadFailed')}
                  {error?.message ? ` (${error.message})` : ''}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  {t('verifyDocument.error.retry')}
                </Button>
              </div>
            ) : rows.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                {narrowed ? t('templatesPage.library.noMatch') : t('templatesPage.library.empty')}
              </p>
            ) : (
              rows.map(renderRow)
            )}
            {dragged && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget('root');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  moveInto(dragged, null);
                  setDragged(null);
                  setDropTarget(null);
                }}
                className={cn(
                  'm-2 rounded-lg border-2 border-dashed py-3 text-center text-sm text-muted-foreground',
                  dropTarget === 'root' && 'border-primary bg-primary/5 text-primary',
                )}
              >
                {t('templatesPage.library.dropRoot')}
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {t('templatesPage.library.footer', {
            folders: folders.length,
            templates: templates.length,
          })}
        </p>
      </main>
      {dialog}
    </div>
  );
}
