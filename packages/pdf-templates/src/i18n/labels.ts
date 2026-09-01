export const SUPPORTED_LOCALES = ['fr', 'en', 'ru', 'ln'] as const;
export type PdfLocale = (typeof SUPPORTED_LOCALES)[number];

export type CertificateTypeKey =
  | 'enrollment'
  | 'completion'
  | 'transfer'
  | 'conduct'
  | 'graduation';

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
  contractTitle: string;
  teacherInformation: string;
  contractInformation: string;
  maritalStatus: string;
  single: string;
  married: string;
  divorced: string;
  widowed: string;
  hasChildren: string;
  yes: string;
  no: string;
  childrenCount: string;
  yearsOfExperience: string;
  position: string;
  specialization: string;
  contractType: string;
  permanent: string;
  fixedTerm: string;
  partTime: string;
  hireDate: string;
  contractEndDate: string;
  salary: string;
  weeklyHours: string;
  hoursPerWeek: string;
  subjectsTaught: string;
  clauses: string;
  employer: string;
  employee: string;
  receiptTitle: string;
  receiptNumber: string;
  amountPaid: string;
  paymentInformation: string;
  paymentType: string;
  paymentDate: string;
  description: string;
  paymentTypes: Record<
    'TUITION' | 'CANTEEN' | 'UNIFORM' | 'EXAM_FEE' | 'TRANSPORT' | 'ACTIVITY' | 'OTHER',
    string
  >;
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
    staleWarning:
      'ATTENTION : ce document a été modifié après signature. Une nouvelle signature est requise.',
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
    draftWatermark: 'BROUILLON — Document non signé, à titre de vérification uniquement',
    contractTitle: 'Contrat de travail',
    teacherInformation: "Informations de l'enseignant",
    contractInformation: 'Informations contractuelles',
    maritalStatus: 'Situation matrimoniale',
    single: 'Célibataire',
    married: 'Marié(e)',
    divorced: 'Divorcé(e)',
    widowed: 'Veuf/Veuve',
    hasChildren: 'Enfants',
    yes: 'Oui',
    no: 'Non',
    childrenCount: "Nombre d'enfants",
    yearsOfExperience: "Années d'expérience",
    position: 'Poste',
    specialization: 'Spécialisation',
    contractType: 'Type de contrat',
    permanent: 'Durée indéterminée (CDI)',
    fixedTerm: 'Durée déterminée (CDD)',
    partTime: 'Temps partiel',
    hireDate: "Date d'embauche",
    contractEndDate: 'Date de fin de contrat',
    salary: 'Rémunération',
    weeklyHours: 'Volume horaire',
    hoursPerWeek: 'h/semaine',
    subjectsTaught: 'Matières enseignées',
    clauses: 'Clauses particulières',
    employer: 'Employeur',
    employee: 'Employé(e)',
    receiptTitle: 'Reçu de paiement',
    receiptNumber: 'N° de reçu',
    amountPaid: 'Montant payé',
    paymentInformation: 'Détails du paiement',
    paymentType: 'Type de paiement',
    paymentDate: 'Date de paiement',
    description: 'Description',
    paymentTypes: {
      TUITION: 'Frais de scolarité',
      CANTEEN: 'Cantine',
      UNIFORM: 'Uniforme',
      EXAM_FEE: "Frais d'examen",
      TRANSPORT: 'Transport',
      ACTIVITY: 'Activité',
      OTHER: 'Autre',
    },
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
    draftWatermark: 'DRAFT — Unsigned document, for verification purposes only',
    contractTitle: 'Employment Contract',
    teacherInformation: 'Teacher Information',
    contractInformation: 'Contract Information',
    maritalStatus: 'Marital Status',
    single: 'Single',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    hasChildren: 'Children',
    yes: 'Yes',
    no: 'No',
    childrenCount: 'Number of Children',
    yearsOfExperience: 'Years of Experience',
    position: 'Position',
    specialization: 'Specialization',
    contractType: 'Contract Type',
    permanent: 'Permanent (open-ended)',
    fixedTerm: 'Fixed-term',
    partTime: 'Part-time',
    hireDate: 'Hire Date',
    contractEndDate: 'Contract End Date',
    salary: 'Salary',
    weeklyHours: 'Weekly Hours',
    hoursPerWeek: 'h/week',
    subjectsTaught: 'Subjects Taught',
    clauses: 'Special Clauses',
    employer: 'Employer',
    employee: 'Employee',
    receiptTitle: 'Payment Receipt',
    receiptNumber: 'Receipt No.',
    amountPaid: 'Amount Paid',
    paymentInformation: 'Payment Details',
    paymentType: 'Payment Type',
    paymentDate: 'Payment Date',
    description: 'Description',
    paymentTypes: {
      TUITION: 'Tuition Fees',
      CANTEEN: 'Canteen',
      UNIFORM: 'Uniform',
      EXAM_FEE: 'Exam Fee',
      TRANSPORT: 'Transport',
      ACTIVITY: 'Activity',
      OTHER: 'Other',
    },
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
    draftWatermark: 'ЧЕРНОВИК — Документ не подписан, только для проверки',
    contractTitle: 'Трудовой договор',
    teacherInformation: 'Информация об учителе',
    contractInformation: 'Условия договора',
    maritalStatus: 'Семейное положение',
    single: 'Не в браке',
    married: 'В браке',
    divorced: 'Разведён(а)',
    widowed: 'Вдовец/вдова',
    hasChildren: 'Дети',
    yes: 'Да',
    no: 'Нет',
    childrenCount: 'Количество детей',
    yearsOfExperience: 'Стаж работы',
    position: 'Должность',
    specialization: 'Специализация',
    contractType: 'Тип договора',
    permanent: 'Бессрочный',
    fixedTerm: 'Срочный',
    partTime: 'Неполная занятость',
    hireDate: 'Дата найма',
    contractEndDate: 'Дата окончания договора',
    salary: 'Заработная плата',
    weeklyHours: 'Нагрузка в неделю',
    hoursPerWeek: 'ч/нед.',
    subjectsTaught: 'Преподаваемые предметы',
    clauses: 'Особые условия',
    employer: 'Работодатель',
    employee: 'Работник',
    receiptTitle: 'Квитанция об оплате',
    receiptNumber: '№ квитанции',
    amountPaid: 'Оплаченная сумма',
    paymentInformation: 'Детали платежа',
    paymentType: 'Тип платежа',
    paymentDate: 'Дата платежа',
    description: 'Описание',
    paymentTypes: {
      TUITION: 'Плата за обучение',
      CANTEEN: 'Столовая',
      UNIFORM: 'Школьная форма',
      EXAM_FEE: 'Экзаменационный сбор',
      TRANSPORT: 'Транспорт',
      ACTIVITY: 'Мероприятие',
      OTHER: 'Другое',
    },
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
    draftWatermark: 'MOKANDA YA LIBOSO — Esignami te, mpo na kotala kaka',
    contractTitle: 'Boyokani ya mosala',
    teacherInformation: 'Nsango ya molakisi',
    contractInformation: 'Makambo ya boyokani',
    maritalStatus: 'Etamboli ya libala',
    single: 'Abali te',
    married: 'Abali',
    divorced: 'Abomaki libala',
    widowed: 'Mobola/Mobola mwasi',
    hasChildren: 'Bana',
    yes: 'Ee',
    no: 'Te',
    childrenCount: 'Motango ya bana',
    yearsOfExperience: 'Mibu ya mosala',
    position: 'Mosala',
    specialization: 'Etuka ya boyekoli',
    contractType: 'Lolenge ya boyokani',
    permanent: 'Ntango elongwa te',
    fixedTerm: 'Ntango ekatami',
    partTime: 'Ngonga moke',
    hireDate: 'Mokolo ya kozwama na mosala',
    contractEndDate: 'Mokolo ya kosuka ya boyokani',
    salary: 'Lifuta',
    weeklyHours: 'Ngonga ya mosala',
    hoursPerWeek: 'ngonga/pɔsɔ',
    subjectsTaught: 'Makambo oyo alakisaka',
    clauses: 'Malako ya sipesiali',
    employer: 'Nkolo mosala',
    employee: 'Mosali',
    receiptTitle: 'Mokanda ya kofuta',
    receiptNumber: 'Motango ya mokanda',
    amountPaid: 'Mbongo oyo efutami',
    paymentInformation: 'Makambo ya kofuta',
    paymentType: 'Lolenge ya kofuta',
    paymentDate: 'Mokolo ya kofuta',
    description: 'Ndimbola',
    paymentTypes: {
      TUITION: 'Mbongo ya kelasi',
      CANTEEN: 'Bileyi',
      UNIFORM: 'Bilamba ya kelasi',
      EXAM_FEE: 'Mbongo ya momekano',
      TRANSPORT: 'Mituka',
      ACTIVITY: 'Mosala ya libanda',
      OTHER: 'Mosusu',
    },
  },
};

export function getPdfLabels(locale: PdfLocale): PdfLabels {
  return labels[locale] ?? labels.fr;
}
