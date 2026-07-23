import {
    type DocumentType,
} from '@/modules/signature/document-signature.schema'
import {
    bulletinPdfStrategy 
} from './strategies/bulletin.pdf-strategy';
import {
    enrollmentPdfStrategy
} from './strategies/enrollment.pdf-strategy';
import {
    certificatePdfStrategy
} from './strategies/certificate.pdf-strategy';
import {DocumentPdfStrategy} from "@/modules/document-pdf/document-pdf.schema";

type PdfStrategyRegistry = {
    [K in DocumentType]: DocumentPdfStrategy<K>;
};

const registry: PdfStrategyRegistry = {
    bulletin: bulletinPdfStrategy,
    enrollment: enrollmentPdfStrategy,
    certificate: certificatePdfStrategy,
};

export function getPdfStrategy<T extends DocumentType>(documentType: T): DocumentPdfStrategy<T> {
    return registry[documentType];
}