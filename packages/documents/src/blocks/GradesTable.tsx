import { Text, View } from '@react-pdf/renderer';
import type { BulletinPayload } from '../document-types/bulletin';
import type { BlockOf } from '../engine/layout';
import { FORMATTERS } from '../engine/variables';
import { mm, type RenderContext } from './context';

const DEFAULT_LABELS = {
  course: 'Cours',
  score: 'Note',
  max: 'Max',
  coefficient: 'Coef.',
  points: 'Points',
  total: 'Total',
  percent: 'Pourcentage',
  rank: 'Rang',
};

type Column = BlockOf<'gradesTable'>['columns'][number];
type Row = BulletinPayload['rows'][number];

const formatNumber = (n: number) => String(FORMATTERS.number!(n, undefined));

const CELL: Record<Column, (row: Row) => string> = {
  course: (row) => row.course,
  score: (row) => (row.score === null ? '—' : formatNumber(row.score)),
  max: (row) => formatNumber(row.max),
  coefficient: (row) => formatNumber(row.coefficient),
  points: (row) => (row.score === null ? '—' : formatNumber(row.score * row.coefficient)),
};

const columnStyle = (column: Column) =>
  column === 'course'
    ? { flex: 3, textAlign: 'left' as const }
    : { flex: 1, textAlign: column === 'coefficient' ? ('center' as const) : ('right' as const) };

export function GradesTable({ block, ctx }: { block: BlockOf<'gradesTable'>; ctx: RenderContext }) {
  const labels = { ...DEFAULT_LABELS, ...block.labels };
  const rows = (ctx.value('rows') ?? []) as Row[];
  const totals = ctx.value('totals') as BulletinPayload['totals'] | undefined;
  const rank = ctx.value('rank') as BulletinPayload['rank'] | undefined;
  const cellPadding = { paddingVertical: 5, paddingHorizontal: 6 };

  return (
    <View style={{ marginBottom: mm(4) }}>
      <View style={{ border: `0.75pt solid ${ctx.colors.border}` }}>
        <View
          style={{ flexDirection: 'row', backgroundColor: ctx.colors.primary, ...cellPadding }}
          fixed
        >
          {block.columns.map((column) => (
            <Text
              key={column}
              style={{ ...columnStyle(column), color: ctx.colors.white, fontWeight: 'bold' }}
            >
              {labels[column]}
            </Text>
          ))}
        </View>
        {rows.map((row, i) => (
          <View
            key={i}
            wrap={false}
            style={{
              flexDirection: 'row',
              ...cellPadding,
              backgroundColor: i % 2 === 1 ? ctx.colors.rowAlt : ctx.colors.white,
              borderTop: `0.5pt solid ${ctx.colors.border}`,
            }}
          >
            {block.columns.map((column) => (
              <Text key={column} style={columnStyle(column)}>
                {CELL[column](row)}
              </Text>
            ))}
          </View>
        ))}
      </View>

      {(block.showTotals || block.showRank) && totals && (
        <Text style={{ marginTop: mm(3) }}>
          {block.showTotals && (
            <>
              <Text style={{ fontWeight: 'bold' }}>{labels.total} : </Text>
              {formatNumber(totals.obtained)} / {formatNumber(totals.max)}
              {'   '}
              <Text style={{ fontWeight: 'bold' }}>{labels.percent} : </Text>
              {formatNumber(totals.percent)} %
            </>
          )}
          {block.showRank && rank && (
            <>
              {'   '}
              <Text style={{ fontWeight: 'bold' }}>{labels.rank} : </Text>
              {rank.position} / {rank.of}
            </>
          )}
        </Text>
      )}
    </View>
  );
}
