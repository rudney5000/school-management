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
} from '../i18n/labels';
import { theme } from '../theme';

export interface PaymentReceiptDocumentProps {
    locale: PdfLocale;
    schoolName: string;
    studentFullName: string;
    amount: number;
    paymentType: string;
    paymentDate: string;
    description: string | null;
    receiptNumber: string | null;
    signature: SignatureBlockProps | null;
}

const styles = StyleSheet.create({
    page: {
        fontFamily: theme.font,
        padding: 40,
        fontSize: 10,
        color: theme.colors.text
    },
    header: {
        borderBottom: `2px solid ${theme.colors.primary}`,
        paddingBottom: 16,
        marginBottom: 24,
    },
    schoolName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
    documentTitle: {
        fontSize: 11,
        color: theme.colors.muted,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    receiptNumber: {
        fontSize: 9,
        color: theme.colors.muted,
        marginTop: 2
    },
    section: {
        marginBottom: 20
    },
    sectionTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        borderBottom: `1px solid ${theme.colors.border}`,
        paddingBottom: 4,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    field: {
        width: '50%',
        marginBottom: 10,
        paddingRight: 12
    },
    label: {
        fontSize: 8.5,
        color: theme.colors.muted,
        marginBottom: 2
    },
    value: {
        fontSize: 11,
        fontWeight: 'bold',
        color: theme.colors.text
    },
    amountBox: {
        backgroundColor: theme.colors.rowAlt,
        padding: 16,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 20,
    },
    amountLabel: {
        fontSize: 9,
        color: theme.colors.muted,
        marginBottom: 4 },
    amountValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.primary
    },
});

function formatAmount(amount: number, locale: PdfLocale): string {
    return new Intl.NumberFormat(locale).format(amount);
}

export function PaymentReceiptDocument({
                                           locale, schoolName, studentFullName, amount, paymentType, paymentDate,
                                           description, receiptNumber, signature,
                                       }: PaymentReceiptDocumentProps) {
    const t = getPdfLabels(locale);
    const formattedDate = new Date(paymentDate).toLocaleDateString(locale);
    const paymentTypeLabel = t.paymentTypes[paymentType as keyof typeof t.paymentTypes] ?? paymentType;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.schoolName}>{schoolName}</Text>
                    <Text style={styles.documentTitle}>{t.receiptTitle}</Text>
                    {receiptNumber && <Text style={styles.receiptNumber}>{t.receiptNumber}: {receiptNumber}</Text>}
                </View>

                <View style={styles.amountBox}>
                    <Text style={styles.amountLabel}>{t.amountPaid}</Text>
                    <Text style={styles.amountValue}>{formatAmount(amount, locale)}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t.paymentInformation}</Text>
                    <View style={styles.grid}>
                        <View style={styles.field}>
                            <Text style={styles.label}>{t.student}</Text>
                            <Text style={styles.value}>{studentFullName}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>{t.paymentType}</Text>
                            <Text style={styles.value}>{paymentTypeLabel}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>{t.paymentDate}</Text>
                            <Text style={styles.value}>{formattedDate}</Text>
                        </View>
                        {description && (
                            <View style={styles.field}>
                                <Text style={styles.label}>{t.description}</Text>
                                <Text style={styles.value}>{description}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {signature && <SignatureBlock {...signature} />}
            </Page>
        </Document>
    );
}