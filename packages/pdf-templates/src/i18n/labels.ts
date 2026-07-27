export const SUPPORTED_LOCALES = ['fr', 'en', 'ru', 'ln'] as const;
export type PdfLocale = typeof SUPPORTED_LOCALES[number];

export type CertificateTypeKey = 'enrollment' | 'completion' | 'transfer' | 'conduct' | 'graduation';

interface PdfLabels {
    signedElectronically: string;
    bulletinTitle: string;
    course: string;
    score: string;
    coefficient: string;
    enrollmentTitle: string;
    student: string;
    dateOfBirth: string;
    class: string;
    enrollmentDate: string;
    parentOrGuardian: string;
    staleWarning: string;
    issuedOn: string;
    certificateTypes: Record<CertificateTypeKey, string>;
    gender: string;
    male: string;
    female: string;
    age: string;
    years: string;
    studentInformation: string;
    enrollmentInformation: string;
    draftWatermark: string;
}

const labels: Record<PdfLocale, PdfLabels> = {
    fr: {
        signedElectronically: 'Signé électroniquement',
        bulletinTitle: 'Bulletin de notes',
        course: 'Cours',
        score: 'Note',
        coefficient: 'Coef.',
        enrollmentTitle: "Attestation d'inscription",
        student: 'Élève',
        dateOfBirth: 'Date de naissance',
        class: 'Classe',
        enrollmentDate: "Date d'inscription",
        parentOrGuardian: 'Parent/Tuteur',
        staleWarning: 'ATTENTION : ce document a été modifié après signature. Une nouvelle signature est requise.',
        issuedOn: 'Délivré le',
        certificateTypes: {
            enrollment: 'Attestation de scolarité',
            completion: 'Attestation de réussite',
            transfer: 'Certificat de transfert',
            conduct: 'Certificat de bonne conduite',
            graduation: 'Attestation de fin de cycle',
        },
        gender: 'Sexe',
        male: 'Masculin',
        female: 'Féminin',
        age: 'Âge',
        years: 'ans',
        studentInformation: "Informations de l'élève",
        enrollmentInformation: "Informations d'inscription",
        draftWatermark: "BROUILLON — Document non signé, à titre de vérification uniquement"
    },
    en: {
        signedElectronically: 'Electronically signed',
        bulletinTitle: 'Report Card',
        course: 'Course',
        score: 'Score',
        coefficient: 'Coeff.',
        enrollmentTitle: 'Enrollment Certificate',
        student: 'Student',
        dateOfBirth: 'Date of Birth',
        class: 'Class',
        enrollmentDate: 'Enrollment Date',
        parentOrGuardian: 'Parent/Guardian',
        staleWarning: 'WARNING: this document was modified after signing. A new signature is required.',
        issuedOn: 'Issued on',
        certificateTypes: {
            enrollment: 'Enrollment Certificate',
            completion: 'Certificate of Completion',
            transfer: 'Transfer Certificate',
            conduct: 'Certificate of Good Conduct',
            graduation: 'Graduation Certificate',
        },
        gender: 'Gender',
        male: 'Male',
        female: 'Female',
        age: 'Age',
        years: 'years old',
        studentInformation: 'Student Information',
        enrollmentInformation: 'Enrollment Information',
        draftWatermark: "DRAFT — Unsigned document, for verification purposes only"
    },
    ru: {
        signedElectronically: 'Подписано электронно',
        bulletinTitle: 'Табель успеваемости',
        course: 'Предмет',
        score: 'Оценка',
        coefficient: 'Коэф.',
        enrollmentTitle: 'Справка о зачислении',
        student: 'Учащийся',
        dateOfBirth: 'Дата рождения',
        class: 'Класс',
        enrollmentDate: 'Дата зачисления',
        parentOrGuardian: 'Родитель/Опекун',
        staleWarning: 'ВНИМАНИЕ: документ был изменён после подписания. Требуется новая подпись.',
        issuedOn: 'Выдано',
        certificateTypes: {
            enrollment: 'Справка о зачислении',
            completion: 'Свидетельство об окончании',
            transfer: 'Справка о переводе',
            conduct: 'Справка о хорошем поведении',
            graduation: 'Свидетельство об окончании обучения',
        },
        gender: 'Пол',
        male: 'Мужской',
        female: 'Женский',
        age: 'Возраст',
        years: 'лет',
        studentInformation: 'Информация об учащемся',
        enrollmentInformation: 'Информация о зачислении',
        draftWatermark: "ЧЕРНОВИК — Документ не подписан, только для проверки"
    },
    ln: {
        signedElectronically: 'Esignami na motindo ya elektroniki',
        bulletinTitle: 'Mokanda ya bopimi',
        course: 'Kelasi',
        score: 'Point',
        coefficient: 'Koef.',
        enrollmentTitle: 'Mokanda ya kokɔtisama',
        student: 'Moyekoli',
        dateOfBirth: 'Mokolo ya mbotama',
        class: 'Kelasi',
        enrollmentDate: 'Mokolo ya kokɔtisama',
        parentOrGuardian: 'Moboti/Mokengeli',
        staleWarning: 'BOKEBI: mokanda oyo ebongwani nsima ya esignami. Esengeli na esignami ya sika.',
        issuedOn: 'Epesami na',
        certificateTypes: {
            enrollment: 'Mokanda ya kokɔtisama',
            completion: 'Mokanda ya kosilisa malamu',
            transfer: 'Mokanda ya bokabwani',
            conduct: 'Mokanda ya etamboli ya malamu',
            graduation: 'Mokanda ya kosukisa boyekoli',
        },
        gender: 'Ebosoni',
        male: 'Mobali',
        female: 'Mwasi',
        age: 'Mbula',
        years: 'mbula',
        studentInformation: 'Nsango ya moyekoli',
        enrollmentInformation: 'Nsango ya kokɔtisama',
        draftWatermark: "MOKANDA YA LIBOSO — Esignami te, mpo na kotala kaka"
    },
};

export function getPdfLabels(locale: PdfLocale): PdfLabels {
    return labels[locale] ?? labels.fr;
}