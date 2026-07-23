import {
    View,
    Text,
    Image,
    StyleSheet
} from '@react-pdf/renderer';
import {
    getPdfLabels,
    type PdfLocale
} from "../i18n/labels";

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingTop: 12,
        borderTop: '1px solid #ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    meta: { fontSize: 8, color: '#555' },
    name: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    role: { fontSize: 9, color: '#333' },
    qr: { width: 56, height: 56 },
    staleBanner: {
        marginTop: 8,
        padding: 4,
        backgroundColor: '#fde8e8',
        color: '#b91c1c',
        fontSize: 8,
        textAlign: 'center',
    },
});

export interface SignatureBlockProps {
    locale: PdfLocale;
    signerName: string;
    signerRole: string;
    signedAt: string;
    verificationQrDataUrl: string;
    isStale?: boolean;
}

export function SignatureBlock({
                                   locale,
                                   signerName,
                                   signerRole,
                                   signedAt,
                                   verificationQrDataUrl,
                                   isStale,
}: SignatureBlockProps) {
    const t = getPdfLabels(locale);

    return (
        <View>
            <View style={styles.container}>
                <View>
                    <Text style={styles.meta}>{t.signedElectronically}</Text>
                    <Text style={styles.name}>{signerName}</Text>
                    <Text style={styles.role}>{signerRole}</Text>
                    <Text style={styles.meta}>{signedAt}</Text>
                </View>
                <Image style={styles.qr} src={verificationQrDataUrl} />
            </View>
            {isStale && <Text style={styles.staleBanner}>{t.staleWarning}</Text>}
        </View>
    );
}