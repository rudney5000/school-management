import {
    View,
    Text,
    Image,
    StyleSheet
} from '@react-pdf/renderer';
import {
    getPdfLabels,
    type PdfLocale
} from '../i18n/labels';
import { theme } from '../theme';

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
        paddingTop: 12,
        borderTop: `1px solid ${theme.colors.border}`,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 32,
    },
    meta: {
        fontFamily: theme.font,
        fontSize: 8,
        color: theme.colors.muted
    },
    name: {
        fontFamily: theme.font,
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
        color: theme.colors.text
    },
    role: {
        fontFamily: theme.font,
        fontSize: 9,
        color: theme.colors.text
    },
    qr: {
        width: 56, height: 56 },
    staleBanner: {
        fontFamily: theme.font,
        marginTop: 8,
        marginHorizontal: 32,
        padding: 4,
        backgroundColor: '#fde8e8',
        color: '#b91c1c',
        fontSize: 8,
        textAlign: 'center',
    },
    draftBanner: {
        fontFamily: theme.font,
        marginTop: 24,
        marginHorizontal: 32,
        padding: 8,
        backgroundColor: theme.colors.rowAlt,
        color: theme.colors.muted,
        fontSize: 9,
        textAlign: 'center',
        borderTop: `1px solid ${theme.colors.border}`,
    },
});

export interface SignatureBlockProps {
    locale: PdfLocale;
    signerName: string;
    signerRole: string;
    signedAt: string | null;
    verificationQrDataUrl: string | null;
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
                {verificationQrDataUrl && <Image style={styles.qr} src={verificationQrDataUrl} />}
            </View>
            {isStale && <Text style={styles.staleBanner}>{t.staleWarning}</Text>}
        </View>
    );
}