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

export interface EnrollmentDocumentProps {
    locale: PdfLocale;
    schoolName: string;
    studentFullName: string;
    className: string;
    enrollmentDate: string;
    dateOfBirth: string;
    parentFullName?: string;
    signature: SignatureBlockProps | null;
}

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10 },
    title: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
    row: { flexDirection: 'row', marginBottom: 6 },
    label: { width: 160, color: '#555' },
    value: { flex: 1, fontWeight: 'bold' },
});

export function EnrollmentDocument({
                                       locale,
                                       schoolName,
                                       studentFullName,
                                       className,
                                       enrollmentDate,
                                       dateOfBirth,
                                       parentFullName,
                                       signature,
}: EnrollmentDocumentProps) {
    const t = getPdfLabels(locale);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{schoolName} — {t.enrollmentTitle}</Text>

                <View style={styles.row}>
                    <Text style={styles.label}>{t.student}</Text>
                    <Text style={styles.value}>{studentFullName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{t.dateOfBirth}</Text>
                    <Text style={styles.value}>{dateOfBirth}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{t.class}</Text>
                    <Text style={styles.value}>{className}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>{t.enrollmentDate}</Text>
                    <Text style={styles.value}>{enrollmentDate}</Text>
                </View>
                {parentFullName && (
                    <View style={styles.row}>
                        <Text style={styles.label}>{t.parentOrGuardian}</Text>
                        <Text style={styles.value}>{parentFullName}</Text>
                    </View>
                )}

                {signature && <SignatureBlock {...signature} />}
            </Page>
        </Document>
    );
}