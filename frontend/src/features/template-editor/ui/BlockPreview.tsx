import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { ImageIcon, QrCode } from 'lucide-react';
import { useTranslation } from '@shared/lib';
import { DEFAULT_MARGINS, DEFAULT_THEME, type LayoutBlock } from '../model/layout';
import { formatNumber, interpolate } from '../model/variables';

/**
 * What the blocks on screen are drawn with: the type's sample data and the
 * template's colours and margins. Values here mirror the PDF engine
 * (packages/documents, blocks/*), so the page reads like the PDF.
 */
export interface PreviewSettings {
  sample: Record<string, unknown>;
  primary: string;
  accent: string;
  fontSize: number;
  margins: { top: number; right: number; bottom: number; left: number };
}

export const PreviewContext = createContext<PreviewSettings>({
  sample: {},
  primary: DEFAULT_THEME.primary,
  accent: DEFAULT_THEME.accent,
  fontSize: DEFAULT_THEME.fontSize,
  margins: DEFAULT_MARGINS,
});

const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const ROW_ALT = '#f8f9fb';

type Align = 'left' | 'center' | 'right';
const FLEX: Record<Align, CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
};

function colorOf(name: unknown, p: PreviewSettings, fallback: string): string {
  switch (name) {
    case 'primary':
      return p.primary;
    case 'accent':
      return p.accent;
    case 'muted':
      return MUTED;
    case 'white':
      return '#ffffff';
    case 'text':
      return '#1a1a1a';
    default:
      return fallback;
  }
}

/** Pulls a band out to the page edges, like the PDF does. */
const bleed = (p: PreviewSettings, top: boolean): CSSProperties => ({
  marginLeft: `-${p.margins.left}mm`,
  marginRight: `-${p.margins.right}mm`,
  paddingLeft: `${p.margins.left}mm`,
  paddingRight: `${p.margins.right}mm`,
  ...(top
    ? { marginTop: `-${p.margins.top}mm`, paddingTop: `${Math.max(p.margins.top, 6)}mm` }
    : {}),
});

/** `**bold**` of the text block. */
function boldSegments(text: string, data: unknown): ReactNode[] {
  return text
    .split(/\*\*(.+?)\*\*/s)
    .map((segment, i) =>
      i % 2 === 1 ? (
        <strong key={i}>{interpolate(segment, data)}</strong>
      ) : (
        interpolate(segment, data)
      ),
    );
}

const GRADE_LABELS = {
  course: 'Cours',
  score: 'Note',
  max: 'Max',
  coefficient: 'Coef.',
  points: 'Points',
  total: 'Total',
  percent: 'Pourcentage',
  rank: 'Rang',
};
export type GradeColumn = 'course' | 'score' | 'max' | 'coefficient' | 'points';
export const GRADE_COLUMNS: GradeColumn[] = ['course', 'score', 'max', 'coefficient', 'points'];
export const defaultGradeLabel = (key: keyof typeof GRADE_LABELS) => GRADE_LABELS[key];

interface GradeRow {
  course: string;
  score: number | null;
  max: number;
  coefficient: number;
}

const CELL: Record<GradeColumn, (row: GradeRow) => string> = {
  course: (row) => row.course,
  score: (row) => (row.score === null ? '—' : formatNumber(row.score)),
  max: (row) => formatNumber(row.max),
  coefficient: (row) => formatNumber(row.coefficient),
  points: (row) => (row.score === null ? '—' : formatNumber(row.score * row.coefficient)),
};

/** The editor shows a few lines of the sample: the real table has every course of the class. */
const PREVIEW_ROWS = 6;

function GradesTableView({ block, p }: { block: LayoutBlock; p: PreviewSettings }) {
  const { t } = useTranslation();
  const columns = (block.columns as GradeColumn[] | undefined) ?? GRADE_COLUMNS;
  const labels = { ...GRADE_LABELS, ...(block.labels as Partial<typeof GRADE_LABELS>) };
  const rows = ((p.sample.rows as GradeRow[] | undefined) ?? []).slice(0, PREVIEW_ROWS);
  const totals = p.sample.totals as { obtained: number; max: number; percent: number } | undefined;
  const rank = p.sample.rank as { position: number; of: number } | null | undefined;
  const showTotals = block.showTotals !== false;
  const showRank = block.showRank !== false;
  const cellStyle = (column: GradeColumn): CSSProperties => ({
    flex: column === 'course' ? 3 : 1,
    textAlign: column === 'course' ? 'left' : column === 'coefficient' ? 'center' : 'right',
    padding: '5pt 6pt',
  });
  return (
    <div style={{ marginBottom: '4mm' }}>
      <div style={{ border: `0.75pt solid ${BORDER}` }}>
        <div
          style={{ display: 'flex', backgroundColor: p.primary, color: '#fff', fontWeight: 700 }}
        >
          {columns.map((column) => (
            <div key={column} style={cellStyle(column)}>
              {labels[column]}
            </div>
          ))}
        </div>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              backgroundColor: i % 2 === 1 ? ROW_ALT : '#fff',
              borderTop: `0.5pt solid ${BORDER}`,
            }}
          >
            {columns.map((column) => (
              <div key={column} style={cellStyle(column)}>
                {CELL[column](row)}
              </div>
            ))}
          </div>
        ))}
        <div
          style={{
            borderTop: `0.5pt dashed ${BORDER}`,
            padding: '3pt 6pt',
            color: MUTED,
            fontSize: '0.85em',
            fontStyle: 'italic',
          }}
        >
          {t('templateEditor.blocks.gradesTable.moreRows')}
        </div>
      </div>
      {(showTotals || showRank) && totals && (
        <p style={{ marginTop: '3mm' }}>
          {showTotals && (
            <>
              <strong>{labels.total} : </strong>
              {formatNumber(totals.obtained)} / {formatNumber(totals.max)}
              {'   '}
              <strong>{labels.percent} : </strong>
              {formatNumber(totals.percent)} %
            </>
          )}
          {showRank && rank && (
            <>
              {'   '}
              <strong>{labels.rank} : </strong>
              {rank.position} / {rank.of}
            </>
          )}
        </p>
      )}
    </div>
  );
}

const DEFAULT_QR_CAPTION =
  'Document n° {{document.number}}\nScannez le code QR pour vérifier son authenticité.';

/** A non-text block of the layout drawn on screen, read only. */
export function BlockPreview({ block }: { block: LayoutBlock }) {
  const p = useContext(PreviewContext);
  const { t } = useTranslation();
  const data = p.sample;
  const tx = (text: unknown) => interpolate(String(text ?? ''), data);

  switch (block.type) {
    case 'header': {
      const band = block.band === true;
      const align = (block.align as Align | undefined) ?? 'center';
      const lines = (block.lines as Array<Record<string, unknown>> | undefined) ?? [];
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '4mm',
            ...(band
              ? { ...bleed(p, true), paddingBottom: '5mm', backgroundColor: p.primary }
              : {}),
          }}
        >
          {typeof block.logo === 'string' && (
            <div
              style={{ width: '20mm', height: '20mm', marginRight: '4mm' }}
              className="flex items-center justify-center rounded bg-black/10"
            >
              <ImageIcon className="size-6 opacity-60" />
            </div>
          )}
          <div style={{ flex: 1 }}>
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  textAlign: align,
                  fontSize: `${(line.size as number | undefined) ?? p.fontSize}pt`,
                  fontWeight: line.bold ? 700 : 400,
                  color: colorOf(line.color, p, band ? '#ffffff' : '#1a1a1a'),
                  lineHeight: 1.25,
                  marginBottom: '1.5pt',
                }}
              >
                {tx(line.text)}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'title': {
      const align = (block.align as Align | undefined) ?? 'center';
      return (
        <div style={{ margin: '3mm 0', textAlign: align }}>
          <div
            style={{
              fontSize: `${(block.size as number | undefined) ?? 16}pt`,
              fontWeight: 700,
              lineHeight: 1.25,
              color: colorOf(block.color ?? 'primary', p, p.primary),
            }}
          >
            {tx(block.text)}
          </div>
          {typeof block.subtitle === 'string' && (
            <div style={{ fontSize: '9pt', color: MUTED, marginTop: '2pt' }}>
              {tx(block.subtitle)}
            </div>
          )}
        </div>
      );
    }

    case 'text':
      return (
        <div style={{ marginBottom: '2mm' }}>
          {String(block.text ?? '')
            .split(/\n\s*\n/)
            .map((paragraph, i) => (
              <p
                key={i}
                style={{
                  textAlign: (block.align as CSSProperties['textAlign']) ?? 'left',
                  fontSize: block.size ? `${block.size as number}pt` : undefined,
                  lineHeight: 1.45,
                  marginBottom: '2.5mm',
                  whiteSpace: 'pre-line',
                }}
              >
                {boldSegments(paragraph.trim(), data)}
              </p>
            ))}
        </div>
      );

    case 'infoGrid': {
      const columns = (block.columns as number | undefined) ?? 2;
      const items = (block.items as Array<{ label: string; value: string }> | undefined) ?? [];
      const band = block.band === true;
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            rowGap: '3pt',
            columnGap: '2mm',
            marginBottom: '4mm',
            ...(band ? { ...bleed(p, false), backgroundColor: ROW_ALT, paddingBlock: '3mm' } : {}),
          }}
        >
          {items.map((item, i) => (
            <div key={i}>
              <strong>{tx(item.label)} : </strong>
              {tx(item.value)}
            </div>
          ))}
        </div>
      );
    }

    case 'gradesTable':
      return <GradesTableView block={block} p={p} />;

    case 'signatures': {
      const slots = (block.slots as Array<{ role: string; name?: string }> | undefined) ?? [];
      const single = slots.length === 1;
      return (
        <div style={{ margin: '4mm 0' }}>
          {typeof block.place === 'string' && (
            <p style={{ textAlign: single ? 'right' : 'left', marginBottom: '2mm' }}>
              {tx(block.place)}
            </p>
          )}
          <div style={{ display: 'flex', justifyContent: single ? 'flex-end' : 'space-between' }}>
            {slots.map((slot, i) => (
              <div
                key={i}
                style={{ width: single ? '42%' : `${90 / slots.length}%`, textAlign: 'center' }}
              >
                <div style={{ color: MUTED, fontSize: '9pt' }}>{tx(slot.role)}</div>
                <div style={{ height: '20mm' }} />
                <div style={{ borderTop: '0.75pt solid #1a1a1a', marginBottom: '3pt' }} />
                {slot.name && <strong>{tx(slot.name)}</strong>}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'qrVerify': {
      const position = (block.position as string | undefined) ?? 'bottom-left';
      const size = (block.size as number | undefined) ?? 22;
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: position === 'bottom-right' ? 'row-reverse' : 'row',
            alignItems: 'center',
            margin: '3mm 0',
          }}
        >
          <div
            style={{ width: `${size}mm`, height: `${size}mm` }}
            className="flex shrink-0 items-center justify-center border border-neutral-400 bg-neutral-50"
          >
            <QrCode className="size-2/3 text-neutral-500" />
          </div>
          <div
            style={{
              fontSize: '7.5pt',
              color: MUTED,
              margin: '0 3mm',
              maxWidth: '70mm',
              whiteSpace: 'pre-line',
              lineHeight: 1.35,
              textAlign: position === 'bottom-right' ? 'right' : 'left',
            }}
          >
            {tx((block.caption as string | undefined) ?? DEFAULT_QR_CAPTION)}
            {position !== 'inline' && (
              <div className="mt-1 font-sans italic">
                {t(`templateEditor.blocks.qrVerify.positions.${position}`)}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'spacer':
      return (
        <div
          style={{ height: `${(block.height as number | undefined) ?? 5}mm` }}
          className="border-y border-dashed border-neutral-300"
        />
      );

    case 'watermark':
      return (
        <div className="py-2 text-center font-sans text-xs text-neutral-500">
          {t('templateEditor.blocks.watermark.onPage', { text: tx(block.text) })}
        </div>
      );

    case 'image': {
      const align = (block.align as Align | undefined) ?? 'center';
      return (
        <div style={{ display: 'flex', justifyContent: FLEX[align], margin: '0 0 3mm' }}>
          <div
            style={{ width: `${(block.width as number | undefined) ?? 40}mm`, height: '20mm' }}
            className="flex items-center justify-center rounded bg-neutral-100"
          >
            <ImageIcon className="size-6 text-neutral-400" />
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="rounded border border-dashed p-2 font-sans text-xs text-neutral-500">
          {block.type}
        </div>
      );
  }
}
