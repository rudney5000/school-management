/**
 * Measures render time and PDF size for each engine and document.
 *
 *   pnpm bench               every engine, each one in its own process
 *   pnpm bench pdfme         one engine (reactpdf | pdfme | gotenberg)
 *
 * Results land in out/: one PDF per engine and document, results.json and
 * results.md (the comparison table).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { cpus, totalmem } from 'node:os';
import { bulletinPayload, certificatePayload } from './shared/fixtures.ts';

const ENGINES = ['reactpdf', 'pdfme', 'gotenberg'] as const;
type Engine = (typeof ENGINES)[number];
type DocKey = 'bulletin' | 'certificate';

const RUNS = Number(process.env.BENCH_RUNS ?? 50);
const WARMUP = 3;
const BATCH = 40;
const CONCURRENCY = 4;

const outDir = fileURLToPath(new URL('../out/', import.meta.url));

interface DocResult {
  coldMs: number;
  medianMs: number;
  p95Ms: number;
  meanMs: number;
  minMs: number;
  sizeBytes: number;
  pages: number | null;
  htmlMs?: number;
}

interface EngineResult {
  engine: Engine;
  docs: Record<DocKey, DocResult>;
  batch: { docs: number; concurrency: number; totalMs: number; docsPerSecond: number };
  maxRssMb: number;
  note?: string;
}

type Renderer = {
  renderBulletin: (p: typeof bulletinPayload) => Promise<Uint8Array>;
  renderCertificate: (p: typeof certificatePayload) => Promise<Uint8Array>;
};

async function loadEngine(engine: Engine): Promise<Renderer> {
  if (engine === 'pdfme') return import('./pdfme/render.ts');
  if (engine === 'reactpdf') return import('./reactpdf/render.ts');
  return import('./tiptap/render.ts');
}

const percentile = (sorted: number[], p: number) =>
  sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]!;
const round = (n: number) => Math.round(n * 10) / 10;
/** Page count via poppler's pdfinfo, since pdfme writes compressed object streams. */
function countPages(file: string): number | null {
  try {
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    return Number(/^Pages:\s+(\d+)/m.exec(info)?.[1] ?? NaN);
  } catch {
    return null;
  }
}

async function time<T>(fn: () => Promise<T>): Promise<[number, T]> {
  const start = performance.now();
  const value = await fn();
  return [performance.now() - start, value];
}

async function measureDoc(
  engine: Engine,
  doc: DocKey,
  render: () => Promise<Uint8Array>,
  html?: () => Promise<string>,
): Promise<DocResult> {
  const [coldMs, first] = await time(render);
  const file = `${outDir}${engine}-${doc}.pdf`;
  writeFileSync(file, first);
  for (let i = 0; i < WARMUP; i++) await render();

  const samples: number[] = [];
  let last = first;
  for (let i = 0; i < RUNS; i++) {
    const [ms, pdf] = await time(render);
    samples.push(ms);
    last = pdf;
  }
  samples.sort((a, b) => a - b);

  let htmlMs: number | undefined;
  if (html) {
    const htmlSamples: number[] = [];
    for (let i = 0; i < RUNS; i++) htmlSamples.push((await time(html))[0]);
    htmlSamples.sort((a, b) => a - b);
    htmlMs = round(percentile(htmlSamples, 50));
  }

  return {
    coldMs: round(coldMs),
    medianMs: round(percentile(samples, 50)),
    p95Ms: round(percentile(samples, 95)),
    meanMs: round(samples.reduce((s, x) => s + x, 0) / samples.length),
    minMs: round(samples[0]!),
    sizeBytes: last.byteLength,
    pages: countPages(file),
    ...(htmlMs === undefined ? {} : { htmlMs }),
  };
}

/** A class's bulletins issued at once: BATCH renders, CONCURRENCY in flight. */
async function measureBatch(render: () => Promise<Uint8Array>) {
  let next = 0;
  const worker = async () => {
    while (next < BATCH) {
      next++;
      await render();
    }
  };
  const [totalMs] = await time(() => Promise.all(Array.from({ length: CONCURRENCY }, worker)));
  return {
    docs: BATCH,
    concurrency: CONCURRENCY,
    totalMs: Math.round(totalMs),
    docsPerSecond: round((BATCH / totalMs) * 1000),
  };
}

async function runEngine(engine: Engine): Promise<EngineResult> {
  const [loadMs, mod] = await time(() => loadEngine(engine));
  let html: { bulletin?: () => Promise<string>; certificate?: () => Promise<string> } = {};
  let note: string | undefined;

  if (engine === 'gotenberg') {
    const tiptap = await import('./tiptap/render.ts');
    const health = await fetch(`${tiptap.GOTENBERG_URL}/health`).catch(() => null);
    if (!health?.ok) {
      throw new Error(
        `Gotenberg is not reachable at ${tiptap.GOTENBERG_URL}. Start it with packages/documents-spike/docker-compose.yml.`,
      );
    }
    const version = await fetch(`${tiptap.GOTENBERG_URL}/version`)
      .then((r) => (r.ok ? r.text() : 'unknown'))
      .catch(() => 'unknown');
    note = `Gotenberg ${version.trim()} over HTTP on the same machine`;
    html = {
      bulletin: () => tiptap.bulletinHtml(bulletinPayload),
      certificate: () => tiptap.certificateHtml(certificatePayload),
    };
  }

  const bulletin = await measureDoc(
    engine,
    'bulletin',
    () => mod.renderBulletin(bulletinPayload),
    html.bulletin,
  );
  const certificate = await measureDoc(
    engine,
    'certificate',
    () => mod.renderCertificate(certificatePayload),
    html.certificate,
  );
  // The module import is part of a real cold start (fonts, WASM, React…).
  bulletin.coldMs = round(bulletin.coldMs + loadMs);

  const batch = await measureBatch(() => mod.renderBulletin(bulletinPayload));
  const maxRssMb = Math.round(process.resourceUsage().maxRSS / 1024);
  return { engine, docs: { bulletin, certificate }, batch, maxRssMb, ...(note ? { note } : {}) };
}

const kb = (b: number) => `${(b / 1024).toFixed(1)} Ko`;
const ms = (n: number) => `${n.toLocaleString('fr-FR')} ms`;

function toMarkdown(results: EngineResult[]): string {
  const label: Record<Engine, string> = {
    reactpdf: 'React-PDF (actuel, référence)',
    pdfme: 'pdfme',
    gotenberg: 'TipTap → HTML → Gotenberg',
  };
  const lines: string[] = [];
  for (const doc of ['bulletin', 'certificate'] as DocKey[]) {
    lines.push(
      `### ${doc === 'bulletin' ? 'Bulletin' : 'Certificat (1 page de texte)'}`,
      '',
      '| Moteur | 1er rendu (à froid) | Médiane | p95 | Min | Taille PDF | Pages |',
      '|---|---:|---:|---:|---:|---:|---:|',
    );
    for (const r of results) {
      const d = r.docs[doc];
      const html = d.htmlMs === undefined ? '' : ` (dont HTML ${ms(d.htmlMs)})`;
      lines.push(
        `| ${label[r.engine]} | ${ms(d.coldMs)} | ${ms(d.medianMs)}${html} | ${ms(d.p95Ms)} | ${ms(d.minMs)} | ${kb(d.sizeBytes)} | ${d.pages ?? '?'} |`,
      );
    }
    lines.push('');
  }
  lines.push(
    `### Lot : ${BATCH} bulletins, ${CONCURRENCY} en parallèle`,
    '',
    '| Moteur | Durée totale | Documents / s | Mémoire max du process Node |',
    '|---|---:|---:|---:|',
  );
  for (const r of results) {
    lines.push(
      `| ${label[r.engine]} | ${ms(r.batch.totalMs)} | ${r.batch.docsPerSecond} | ${r.maxRssMb} Mo |`,
    );
  }
  lines.push(
    '',
    `Machine : ${cpus().length} cœurs (${cpus()[0]?.model.trim()}), ${Math.round(totalmem() / 1024 ** 3)} Go, Node ${process.version}. ${RUNS} rendus mesurés après ${WARMUP} de chauffe.`,
  );
  for (const r of results) if (r.note) lines.push(`${label[r.engine]} : ${r.note}.`);
  return lines.join('\n') + '\n';
}

mkdirSync(outDir, { recursive: true });
const only = process.argv[2] as Engine | undefined;

if (only) {
  if (!ENGINES.includes(only)) throw new Error(`Unknown engine: ${only}`);
  const result = await runEngine(only);
  process.stdout.write(`${JSON.stringify(result)}\n`);
} else {
  const self = fileURLToPath(import.meta.url);
  const results: EngineResult[] = [];
  for (const engine of ENGINES) {
    process.stderr.write(`▸ ${engine}…\n`);
    try {
      const out = execFileSync(process.execPath, ['--import', 'tsx', self, engine], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
      });
      results.push(JSON.parse(out.trim().split('\n').pop()!));
    } catch {
      process.stderr.write(`  ✗ ${engine} skipped (see error above)\n`);
    }
  }
  writeFileSync(`${outDir}results.json`, JSON.stringify(results, null, 2));
  const md = toMarkdown(results);
  writeFileSync(`${outDir}results.md`, md);
  process.stdout.write(`\n${md}`);
}
