/**
 * Sample payloads shared by every engine, so each one renders exactly the same
 * data. The bulletin follows the payload shape of the design document
 * (§4, `bulletin` document type); the certificate fills a full A4 page of text.
 */

export interface GradeRow {
  course: string;
  score: number | null;
  max: number;
  coefficient: number;
}

export interface BulletinPayload {
  school: { name: string; code: string; city: string };
  student: { fullName: string; birthDate: string; gender: 'M' | 'F'; matricule: string };
  class: { name: string; level: string };
  period: { name: string; schoolYear: string };
  rows: GradeRow[];
  totals: { obtained: number; max: number; percent: number };
  rank: { position: number; of: number } | null;
  mention: string | null;
  decision: string | null;
  document: { number: string; issuedAt: string; verifyUrl: string };
  signature: { signerName: string; signerRole: string };
}

export interface CertificatePayload {
  school: { name: string; code: string; city: string; address: string };
  student: {
    fullName: string;
    birthDate: string;
    birthPlace: string;
    gender: 'M' | 'F';
    matricule: string;
  };
  class: { name: string; level: string };
  period: { schoolYear: string };
  parent: { fullName: string };
  document: { number: string; issuedAt: string; verifyUrl: string };
  signature: { signerName: string; signerRole: string };
}

const rows: GradeRow[] = [
  { course: 'Mathématiques', score: 34, max: 40, coefficient: 4 },
  { course: 'Français', score: 31, max: 40, coefficient: 4 },
  { course: 'Physique-Chimie', score: 26, max: 40, coefficient: 3 },
  { course: 'Biologie', score: 28, max: 40, coefficient: 3 },
  { course: 'Histoire-Géographie', score: 15, max: 20, coefficient: 2 },
  { course: 'Anglais', score: 16, max: 20, coefficient: 2 },
  { course: 'Éducation Civique', score: 17, max: 20, coefficient: 1 },
  { course: 'Informatique', score: 18, max: 20, coefficient: 1 },
  { course: 'Religion', score: 9, max: 10, coefficient: 1 },
  { course: 'Éducation Physique', score: 8, max: 10, coefficient: 1 },
  { course: 'Dessin', score: null, max: 10, coefficient: 1 },
  { course: 'Lingala', score: 14, max: 20, coefficient: 1 },
];

const obtained = rows.reduce((sum, r) => sum + (r.score ?? 0), 0);
const max = rows.reduce((sum, r) => sum + r.max, 0);

export const bulletinPayload: BulletinPayload = {
  school: { name: 'Complexe Scolaire Saint-Joseph', code: 'SJG', city: 'Kinshasa' },
  student: {
    fullName: 'Marie Kabila Mbuyi',
    birthDate: '2011-03-12',
    gender: 'F',
    matricule: 'SJG-2019-0457',
  },
  class: { name: '1ère Année Secondaire A', level: 'Secondaire' },
  period: { name: '1er Trimestre', schoolYear: '2025-2026' },
  rows,
  totals: { obtained, max, percent: Math.round((obtained / max) * 1000) / 10 },
  rank: { position: 4, of: 38 },
  mention: 'Distinction',
  decision: 'Admise',
  document: {
    number: 'SJG-BUL-2025-2026-000045',
    issuedAt: '2025-12-19',
    verifyUrl: 'https://app.example.cd/verify/5f0c1d2e-8a4b-4c3d-9e2f-1a2b3c4d5e6f',
  },
  signature: { signerName: 'Jean-Pierre Lukusa', signerRole: "Chef d'établissement" },
};

export const certificatePayload: CertificatePayload = {
  school: {
    name: 'Complexe Scolaire Saint-Joseph',
    code: 'SJG',
    city: 'Kinshasa',
    address: '12, avenue de la Justice, Commune de la Gombe, Kinshasa',
  },
  student: {
    fullName: 'Marie Kabila Mbuyi',
    birthDate: '2011-03-12',
    birthPlace: 'Lubumbashi',
    gender: 'F',
    matricule: 'SJG-2019-0457',
  },
  class: { name: '1ère Année Secondaire A', level: 'Secondaire' },
  period: { schoolYear: '2025-2026' },
  parent: { fullName: 'Joseph Kabila Ilunga' },
  document: {
    number: 'SJG-CER-2025-2026-000112',
    issuedAt: '2025-12-19',
    verifyUrl: 'https://app.example.cd/verify/0b7e6d5c-4f3a-4b2c-8d1e-9f8a7b6c5d4e',
  },
  signature: { signerName: 'Jean-Pierre Lukusa', signerRole: "Chef d'établissement" },
};

/**
 * Body of the certificate, one paragraph per entry. Both engines receive the
 * same text with `{{variables}}` and `**bold**` spans, so the comparison is fair.
 */
export const certificateParagraphs: string[] = [
  'Je soussigné, **{{signature.signerName}}**, {{signature.signerRole}} du **{{school.name}}**, établissement situé au {{school.address}}, certifie par la présente que :',
  "L'élève **{{student.fullName}}**, née le **{{student.birthDate|date}}** à {{student.birthPlace}}, inscrite sous le matricule **{{student.matricule}}**, fille de {{parent.fullName}}, est régulièrement inscrite dans notre établissement pour l'année scolaire **{{period.schoolYear}}**, en classe de **{{class.name}}** ({{class.level}}).",
  "L'intéressée suit avec assiduité l'ensemble des enseignements prévus au programme officiel du Ministère de l'Enseignement Primaire, Secondaire et Technique pour son niveau d'études. Elle a acquitté les frais de scolarité exigibles à ce jour et ne fait l'objet d'aucune mesure disciplinaire en cours.",
  "Durant les années précédentes passées dans notre établissement, elle a fait preuve d'un comportement exemplaire, d'un sens des responsabilités apprécié de l'équipe pédagogique et d'une participation active à la vie scolaire, notamment au sein du club de lecture et des activités sportives organisées par l'établissement.",
  "Le présent certificat est délivré à la demande de l'intéressée et de son représentant légal, pour servir et valoir ce que de droit, notamment auprès des administrations publiques, des organismes de bourses d'études et de tout établissement scolaire auquel elle souhaiterait présenter sa candidature.",
  "Toute rature, surcharge ou modification apportée au présent document le rend nul et de nul effet. L'authenticité de ce certificat peut être vérifiée à tout moment en scannant le code QR figurant au bas de cette page, ou en saisissant son numéro sur la page de vérification de l'établissement.",
  "L'établissement se tient à la disposition de toute autorité compétente pour fournir les informations complémentaires qui pourraient être nécessaires à l'instruction d'un dossier concernant l'élève, dans le respect de la confidentialité des données personnelles qui lui sont confiées.",
];
