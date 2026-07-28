import type {AttachmentCategory} from "@entities/attachment";

export const categoryLabels: Record<AttachmentCategory, string> = {
    birth_certificate: 'Certificat de naissance',
    medical_certificate: 'Certificat médical',
    previous_report: 'Bulletin précédent',
    student_photo: "Photo de l'élève",
    parent_id: "Pièce d'identité du parent",
    payment_receipt: 'Reçu de paiement',
    diploma: 'Diplôme',
    criminal_record: 'Casier judiciaire',
    resume: 'CV',
    identity_document: "Pièce d'identité",
    other: 'Autre',
}