import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticate } from '../../shopify.server';
import { downloadOfferPolicyCsv } from '../../lib/offer-policy-csv-download.client';
import {
  applyOfferPolicyCsvImport,
  exportOfferPolicyCsv,
  validateOfferPolicyCsvImport,
} from '../../services/offer-policy-csv.server';

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (new URL(request.url).searchParams.get('download') === '1') {
    const csv = await exportOfferPolicyCsv(session.shop);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="offer-policies-v1.csv"',
        'Cache-Control': 'no-store',
      },
    });
  }
  return json({ ready: true });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? '');
  const csv = String(formData.get('csv') ?? '');
  if (!csv) return json({ valid: false, error: 'missing_csv' }, { status: 400 });
  if (intent === 'validate') {
    return json(await validateOfferPolicyCsvImport({ shopId: session.shop, csv }));
  }
  if (intent === 'apply') {
    return json(await applyOfferPolicyCsvImport({ admin, shopId: session.shop, csv }));
  }
  return json({ valid: false, error: 'unknown_intent' }, { status: 400 });
}

type ImportResult = {
  valid?: boolean;
  rowCount?: number;
  changedCount?: number;
  appliedCount?: number;
  syncedCount?: number;
  errors?: Array<{ row: number | null; field: string; code: string }>;
  syncErrors?: Array<{ bundleId: string; code: string }>;
  error?: string;
};

export default function OfferOperationsRoute() {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();
  const [csv, setCsv] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [exportBusy, setExportBusy] = useState(false);
  const [exportError, setExportError] = useState(false);
  const dropZoneRef = useRef<any>(null);
  const result = fetcher.data as ImportResult | undefined;
  const busy = fetcher.state !== 'idle';

  const handleFile = async (event: Event) => {
    const target = event.currentTarget as HTMLElement & { files?: FileList | File[] };
    const file = target.files ? Array.from(target.files)[0] : undefined;
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setCsv('');
      setFileName('');
      setFileError(t('offerPolicyCsv.errors.file_too_large'));
      return;
    }
    setCsv(await file.text());
    setFileName(file.name);
    setFileError('');
  };

  const submit = (intent: 'validate' | 'apply') => {
    const formData = new FormData();
    formData.set('intent', intent);
    formData.set('csv', csv);
    fetcher.submit(formData, { method: 'post' });
  };

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;
    const handleDropRejected = () => setFileError(t('offerPolicyCsv.errors.invalid_csv'));
    dropZone.addEventListener('droprejected', handleDropRejected);
    return () => dropZone.removeEventListener('droprejected', handleDropRejected);
  }, [t]);

  const handleExport = async () => {
    setExportBusy(true);
    setExportError(false);
    try {
      await downloadOfferPolicyCsv();
    } catch {
      setExportError(true);
    } finally {
      setExportBusy(false);
    }
  };

  return (
    <s-page heading={t('offerPolicyCsv.title')} inlineSize="large">
      <s-box paddingBlockEnd="large-100">
        <s-stack direction="block" gap="large">
          <s-section heading={t('offerPolicyCsv.export.title')}>
            <s-stack direction="block" gap="base">
              <s-paragraph>{t('offerPolicyCsv.export.description')}</s-paragraph>
              {exportError ? (
                <s-banner tone="critical" heading={t('offerPolicyCsv.export.error')} />
              ) : null}
              <s-button loading={exportBusy || undefined} disabled={exportBusy || undefined} onClick={handleExport}>
                {t('offerPolicyCsv.export.action')}
              </s-button>
            </s-stack>
          </s-section>

          <s-section heading={t('offerPolicyCsv.import.title')}>
            <s-stack direction="block" gap="base">
              <s-paragraph>{t('offerPolicyCsv.import.description')}</s-paragraph>
              <s-banner tone="info" heading={t('offerPolicyCsv.import.safetyTitle')}>
                <s-paragraph>{t('offerPolicyCsv.import.safetyBody')}</s-paragraph>
              </s-banner>
              <s-drop-zone
                ref={dropZoneRef}
                accept=".csv,text/csv"
                label={t('offerPolicyCsv.import.dropLabel')}
                accessibilityLabel={t('offerPolicyCsv.import.dropAccessibility')}
                error={fileError || undefined}
                disabled={busy || undefined}
                onChange={handleFile}
              />
              {fileName ? <s-text color="subdued">{fileName}</s-text> : null}
              <s-button-group>
                <s-button disabled={!csv || busy || undefined} loading={busy || undefined} onClick={() => submit('validate')}>
                  {t('offerPolicyCsv.import.validate')}
                </s-button>
                <s-button variant="primary" disabled={!csv || busy || undefined} loading={busy || undefined} onClick={() => submit('apply')}>
                  {t('offerPolicyCsv.import.apply')}
                </s-button>
              </s-button-group>
            </s-stack>
          </s-section>

          {result ? (
            <s-section heading={t('offerPolicyCsv.result.title')}>
              <s-stack direction="block" gap="base">
                <s-banner
                  tone={result.valid && (result.syncErrors?.length ?? 0) === 0 ? 'success' : 'critical'}
                  heading={result.valid
                    ? t('offerPolicyCsv.result.valid')
                    : t('offerPolicyCsv.result.invalid')}
                >
                  <s-paragraph>
                    {t('offerPolicyCsv.result.summary', {
                      rows: result.rowCount ?? 0,
                      changed: result.changedCount ?? 0,
                      applied: result.appliedCount ?? 0,
                      synced: result.syncedCount ?? 0,
                    })}
                  </s-paragraph>
                </s-banner>
                {(result.errors ?? []).slice(0, 20).map((error, index) => (
                  <s-text key={`${error.row}-${error.field}-${error.code}-${index}`}>
                    {t('offerPolicyCsv.result.rowError', {
                      row: error.row ?? 0,
                      field: error.field,
                      message: t(`offerPolicyCsv.errors.${error.code}`),
                    })}
                  </s-text>
                ))}
                {(result.syncErrors ?? []).map((error) => (
                  <s-text key={error.bundleId}>
                    {t('offerPolicyCsv.result.syncError', { bundleId: error.bundleId })}
                  </s-text>
                ))}
              </s-stack>
            </s-section>
          ) : null}
        </s-stack>
      </s-box>
    </s-page>
  );
}
