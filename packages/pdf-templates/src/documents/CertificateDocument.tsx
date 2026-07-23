import {
    Document,
    Page,
    Text,
    StyleSheet
} from '@react-pdf/renderer';
import {
    SignatureBlock,
    type SignatureBlockProps
} from '../components/SignatureBlock';
import {
    type CertificateTypeKey,
    getPdfLabels,
    type PdfLocale
} from "../i18n/labels";

export interface CertificateDocumentProps {
    locale: PdfLocale;
    schoolName: string;
    studentFullName: string;
    type: CertificateTypeKey;
    content: string;
    issuedAt: string;
    signature: SignatureBlockProps | null;
}

const styles = StyleSheet.create({
    page: { padding: 32, fontSize: 10 },
    title: { fontSize: 14, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    subtitle: { fontSize: 11, marginBottom: 20, textAlign: 'center', color: '#555' },
    body: { fontSize: 11, lineHeight: 1.6, marginBottom: 24 },
    issuedAt: { fontSize: 9, color: '#555', marginBottom: 12 },
});

export function CertificateDocument({
                                        locale,
                                        schoolName,
                                        studentFullName,
                                        type,
                                        content,
                                        issuedAt,
                                        signature,
}: CertificateDocumentProps) {
    const t = getPdfLabels(locale);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Text style={styles.title}>{schoolName}</Text>
                <Text style={styles.subtitle}>{t.certificateTypes[type]}</Text>

                <Text style={styles.issuedAt}>
                    {t.issuedOn} {issuedAt} — {studentFullName}
                </Text>
                <Text style={styles.body}>{content}</Text>

                {signature && <SignatureBlock {...signature} />}
            </Page>
        </Document>
    );
}