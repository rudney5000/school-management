import { useMemo, type ReactNode } from 'react';
import { useParams } from '@tanstack/react-router';
import { CircleHelp, Loader2, ShieldAlert, ShieldCheck, WifiOff } from 'lucide-react';
import i18n from '@app/i18n/i18n';
import { isSupportedLocale } from '@shared/config/i18n/locale-config';
import { Button } from '@shared/ui/button';
import { cn } from '@shared/lib/utils';
import { useDocumentVerification, type DocumentVerification } from '@entities/issued-document';

const LOCALE_STORAGE_KEY = 'locale';

/**
 * The page opens from a QR code, outside of the /$locale routes: the language
 * is the one the visitor chose in the app before, else the browser's, else
 * French.
 */
function pageLanguage(): string {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) ?? undefined;
    if (isSupportedLocale(saved)) return saved;
  } catch {
    // Storage can be blocked; the browser language still works.
  }
  const browser = navigator.language?.slice(0, 2);
  return isSupportedLocale(browser) ? browser : 'fr';
}

function formatDate(day: string, language: string): string {
  const date = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return new Intl.DateTimeFormat(language, { dateStyle: 'long', timeZone: 'UTC' }).format(date);
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-muted/40 px-4 py-10 text-foreground sm:items-center">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 sm:flex-row sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium sm:text-right">{value}</dd>
    </div>
  );
}

function Verdict({
  tone,
  icon,
  title,
  text,
}: {
  tone: 'valid' | 'revoked' | 'unknown';
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-xl p-4',
        tone === 'valid' &&
          'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100',
        tone === 'revoked' && 'bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-100',
        tone === 'unknown' && 'bg-muted text-foreground',
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        <p className="text-sm opacity-90">{text}</p>
      </div>
    </div>
  );
}

function Details({ doc, language }: { doc: DocumentVerification; language: string }) {
  const t = i18n.getFixedT(language);
  return (
    <dl className="divide-y divide-border">
      <Row
        label={t('verifyDocument.number')}
        value={<span className="font-mono">{doc.number}</span>}
      />
      <Row
        label={t('verifyDocument.type')}
        value={t(`verifyDocument.types.${doc.documentType}`, { defaultValue: doc.documentType })}
      />
      <Row label={t('verifyDocument.school')} value={doc.schoolName} />
      {doc.holderName && <Row label={t('verifyDocument.holder')} value={doc.holderName} />}
      <Row label={t('verifyDocument.issuedAt')} value={formatDate(doc.issuedAt, language)} />
      {doc.revokedAt && (
        <Row label={t('verifyDocument.revokedAt')} value={formatDate(doc.revokedAt, language)} />
      )}
      {doc.replacedBy && (
        <Row
          label={t('verifyDocument.replacedBy')}
          value={<span className="font-mono">{doc.replacedBy}</span>}
        />
      )}
    </dl>
  );
}

export default function VerifyDocumentPage() {
  const { documentId } = useParams({ strict: false }) as { documentId: string };
  const language = useMemo(pageLanguage, []);
  const t = i18n.getFixedT(language);
  const { data, isPending, isError, refetch, isFetching } = useDocumentVerification(documentId);

  if (isPending) {
    return (
      <Shell>
        <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          <span>{t('verifyDocument.loading')}</span>
        </div>
      </Shell>
    );
  }

  if (isError) {
    return (
      <Shell>
        <div className="space-y-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
          <Verdict
            tone="unknown"
            icon={<WifiOff className="h-6 w-6" aria-hidden />}
            title={t('verifyDocument.error.title')}
            text={t('verifyDocument.error.text')}
          />
          <Button className="w-full" onClick={() => refetch()} disabled={isFetching}>
            {t('verifyDocument.error.retry')}
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-5 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-foreground/10">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('verifyDocument.heading')}
        </p>

        {!data ? (
          <Verdict
            tone="unknown"
            icon={<CircleHelp className="h-6 w-6" aria-hidden />}
            title={t('verifyDocument.notFound.title')}
            text={t('verifyDocument.notFound.text')}
          />
        ) : data.status === 'issued' ? (
          <Verdict
            tone="valid"
            icon={<ShieldCheck className="h-6 w-6" aria-hidden />}
            title={t('verifyDocument.valid.title')}
            text={t('verifyDocument.valid.text')}
          />
        ) : (
          <Verdict
            tone="revoked"
            icon={<ShieldAlert className="h-6 w-6" aria-hidden />}
            title={t('verifyDocument.revoked.title')}
            text={t(
              data.replacedBy
                ? 'verifyDocument.revoked.textReplaced'
                : 'verifyDocument.revoked.text',
            )}
          />
        )}

        {data && <Details doc={data} language={language} />}

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('verifyDocument.privacy')}
        </p>
      </div>
    </Shell>
  );
}
