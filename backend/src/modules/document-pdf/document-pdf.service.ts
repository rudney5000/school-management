import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import {eq} from "drizzle-orm";
import {db} from "@/db";
import {
    users,
    workers
} from "@/db/schema";
import { AppError } from '@/shared/errors/app-error';
import {
    type DocumentType,
    DocumentParamsMap
} from "@/modules/signature/document-signature.schema";
import {
    DocumentSignaturesService
} from "@/modules/signature/document-signature.service";
import {
    getPdfStrategy
} from "@/modules/document-pdf/document-pdf.registry";
import {
    PdfLocale
} from "@school-hub/pdf-templates/src/i18n/labels";

const APP_BASE_URL = process.env.APP_BASE_URL ?? 'https://school-management-frontend-beta-nine.vercel.app';

export class DocumentPdfService {
    private readonly signatures = new DocumentSignaturesService();

    async generate<T extends DocumentType>(
        documentType: T,
        params: DocumentParamsMap[T],
        locale: PdfLocale,
    ): Promise<Buffer> {
        const status = await this.signatures.getStatus(documentType, params);

        if (!status.isSigned) {
            throw new AppError('NOT_SIGNED', 'Ce document doit être signé avant téléchargement', 422);
        }
        if (status.isStale) {
            throw new AppError('SIGNATURE_STALE', 'Le contenu a changé depuis la signature', 409);
        }

        const [signer] = await db
            .select({
                role: users.role,
                email: users.email,
                workerFirstName: workers.firstName,
                workerLastName: workers.lastName,
                workerJobTitle: workers.jobTitle,
            })
            .from(users)
            .leftJoin(workers, eq(users.workerId, workers.id))
            .where(eq(users.id, status.signature.signedByUserId));


        if (!signer) {
            throw new AppError('NOT_FOUND', 'Utilisateur signataire introuvable', 404);
        }

        const signerName = signer.workerFirstName && signer.workerLastName
            ? `${signer.workerFirstName} ${signer.workerLastName}`
            : signer.email;

        const signerRoleLabel = signer.workerJobTitle ?? signer.role;

        const verificationQrDataUrl = await QRCode.toDataURL(
            `${APP_BASE_URL}/verify/${status.signature.id}`,
            { margin: 0, width: 160 },
        );

        const strategy = getPdfStrategy(documentType);
        const element = await strategy.buildDocument(params, locale, {
            locale,
            signerName,
            signerRole: signerRoleLabel,
            signedAt: status.signature.signedAt.toLocaleString(locale),
            verificationQrDataUrl,
            isStale: false,
        });

        return renderToBuffer(element);
    }
}