import {
    type DocumentType,
    DocumentSignatureStrategy
} from '@/modules/signature/document-signature.schema'
import {
    bulletinSignatureStrategy
} from "@/modules/signature/strategies/bulletin.strategy";
import {
    enrollmentSignatureStrategy
} from "@/modules/signature/strategies/enrollment.strategy";
import {
    certificateSignatureStrategy
} from "@/modules/signature/strategies/certificate.strategy";

type StrategyRegistry = {
    [K in DocumentType]: DocumentSignatureStrategy<K>
}

const signatureStrategyRegistry: StrategyRegistry = {
    bulletin: bulletinSignatureStrategy,
    enrollment: enrollmentSignatureStrategy,
    certificate: certificateSignatureStrategy,
}

export function getSignatureStrategy<T extends DocumentType>(
    documentType: T
): DocumentSignatureStrategy<T> {
    return signatureStrategyRegistry[documentType]
}