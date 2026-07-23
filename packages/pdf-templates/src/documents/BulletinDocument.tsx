import {
    Document,
    Page,
    View,
    Text,
    StyleSheet
} from '@react-pdf/renderer';
import {
    SignatureBlock,
    type SignatureBlockProps
} from '../components/SignatureBlock';
import {
    getPdfLabels,
    type PdfLocale
} from "../i18n/labels";

export interface BulletinDocumentProps {
    locale: PdfLocale;
    schoolName: string;
    studentFullName: string;
    className: string;
    academicPeriodLabel: string;
    rows: Array<{ course: string; score: string; maxScore: string; coefficient: string }>;
    signature: SignatureBlockProps | null;
}

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10 },
    title: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    row: { flexDirection: 'row', borderBottom: '0.5px solid #eee', paddingVertical: 4 },
    cell: { flex: 1 },
});

export function BulletinDocument({
                                     locale,
                                     schoolName,
                                     studentFullName,
                                     className,
                                     academicPeriodLabel,
                                     rows,
                                     signature,
}: BulletinDocumentProps) {
    const t = getPdfLabels(locale);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{schoolName} — {t.bulletinTitle}</Text>
                <Text>
                    {studentFullName} — {className} — {academicPeriodLabel}
                </Text>

                <View style={{ marginTop: 16 }}>
                    {rows.map((r, i) => (
                        <View key={i} style={styles.row}>
                            <Text style={styles.cell}>{r.course}</Text>
                            <Text style={styles.cell}>
                                {r.score} / {r.maxScore}
                            </Text>
                            <Text style={styles.cell}>{t.coefficient} {r.coefficient}</Text>
                        </View>
                    ))}
                </View>

                {signature && <SignatureBlock {...signature} />}
            </Page>
        </Document>
    );
}