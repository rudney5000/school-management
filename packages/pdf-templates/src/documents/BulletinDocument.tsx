import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Svg
} from '@react-pdf/renderer';
import {
    SignatureBlock,
    type SignatureBlockProps
} from '../components/SignatureBlock';
import {
    ElephantWatermark
} from '../components/ElephantWatermark';
import {
    getPdfLabels,
    type PdfLocale
} from '../i18n/labels';
import { theme } from '../theme';

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
    page: {
        fontFamily: theme.font,
        fontSize: 10,
        color: theme.colors.text,
        paddingBottom: 60,
    },
    watermarkLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    },
    header: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 24,
        paddingHorizontal: 32,
    },
    schoolName: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    docTitle: {
        color: theme.colors.accent,
        fontSize: 11,
        marginTop: 2,
    },
    studentBand: {
        backgroundColor: theme.colors.rowAlt,
        paddingVertical: 10,
        paddingHorizontal: 32,
        borderBottom: `1px solid ${theme.colors.border}`,
    },
    studentName: { fontSize: 13, fontWeight: 'bold' },
    studentMeta: { fontSize: 9, color: theme.colors.muted, marginTop: 2 },
    content: { paddingHorizontal: 32, paddingTop: 20 },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: theme.colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    tableHeaderCell: { color: '#ffffff', fontSize: 9, fontWeight: 'bold', flex: 1 },
    row: {
        flexDirection: 'row',
        paddingVertical: 7,
        paddingHorizontal: 8,
        borderBottom: `0.5px solid ${theme.colors.border}`,
    },
    rowAlt: { backgroundColor: theme.colors.rowAlt },
    cell: { flex: 1, fontSize: 9.5 },
    scoreCell: { flex: 1, fontSize: 9.5, fontWeight: 'bold', color: theme.colors.primary },
    coefBadge: {
        fontSize: 8,
        color: theme.colors.primaryLight,
        backgroundColor: '#eef2f7',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 3,
        alignSelf: 'flex-start',
    },
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
                <Svg style={styles.watermarkLayer} viewBox="0 0 595 842">
                    <ElephantWatermark />
                </Svg>

                <View style={styles.header}>
                    <Text style={styles.schoolName}>{schoolName}</Text>
                    <Text style={styles.docTitle}>{t.bulletinTitle}</Text>
                </View>

                <View style={styles.studentBand}>
                    <Text style={styles.studentName}>{studentFullName}</Text>
                    <Text style={styles.studentMeta}>{className} — {academicPeriodLabel}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableHeaderCell}>{t.course}</Text>
                        <Text style={styles.tableHeaderCell}>{t.score}</Text>
                        <Text style={styles.tableHeaderCell}>{t.coefficient}</Text>
                    </View>

                    {rows.map((r, i) => (
                        <View key={i} style={[styles.row, i % 2 === 1 ? styles.rowAlt : {}]}>
                            <Text style={styles.cell}>{r.course}</Text>
                            <Text style={styles.scoreCell}>{r.score} / {r.maxScore}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.coefBadge}>{r.coefficient}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {signature && <SignatureBlock {...signature} />}
            </Page>
        </Document>
    );
}