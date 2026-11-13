import type { LayoutBlock } from './layout';

/**
 * Blocks the "Insert" menu offers, in menu order. Images need an uploaded
 * file, which the editor cannot pick yet, so they are left out.
 */
export const INSERTABLE_BLOCKS = [
  'header',
  'title',
  'infoGrid',
  'gradesTable',
  'signatures',
  'qrVerify',
  'spacer',
  'watermark',
] as const;

export type InsertableBlock = (typeof INSERTABLE_BLOCKS)[number];

/**
 * A new block, ready to print. Its texts are the wording of school papers,
 * in French: the school rewords them in the block's settings.
 */
export function newBlock(type: InsertableBlock, documentType: string): LayoutBlock {
  const bulletin = documentType === 'bulletin';
  switch (type) {
    case 'header':
      return {
        type: 'header',
        align: 'center',
        band: false,
        lines: [
          { text: 'RÉPUBLIQUE DÉMOCRATIQUE DU CONGO', size: 8 },
          { text: "Ministère de l'Enseignement Primaire, Secondaire et Technique", size: 7.5 },
          { text: '{{school.name|upper}}', size: 14, bold: true },
          ...(bulletin
            ? [{ text: '{{period.name}} — {{period.schoolYear}}', size: 10, color: 'accent' }]
            : []),
        ],
      };
    case 'title':
      return {
        type: 'title',
        text: bulletin ? 'BULLETIN SCOLAIRE' : 'TITRE',
        size: 16,
        align: 'center',
      };
    case 'infoGrid':
      return bulletin
        ? {
            type: 'infoGrid',
            columns: 2,
            band: false,
            items: [
              { label: 'Élève', value: '{{student.fullName}}' },
              { label: 'Classe', value: '{{class.name}}' },
              { label: 'Né(e) le', value: '{{student.birthDate|date|default:—}}' },
              { label: 'Matricule', value: '{{student.matricule|default:—}}' },
            ],
          }
        : {
            type: 'infoGrid',
            columns: 2,
            band: false,
            items: [
              { label: 'École', value: '{{school.name}}' },
              { label: 'N°', value: '{{document.number}}' },
            ],
          };
    case 'gradesTable':
      return {
        type: 'gradesTable',
        columns: ['course', 'score', 'max', 'coefficient', 'points'],
        showTotals: true,
        showRank: true,
      };
    case 'signatures':
      return {
        type: 'signatures',
        place: 'Fait à {{school.city}}, le {{document.issuedAt|date}}',
        slots: bulletin
          ? [{ role: 'Le Titulaire' }, { role: "Le Chef d'établissement" }]
          : [{ role: "Le Chef d'établissement" }],
      };
    case 'qrVerify':
      return { type: 'qrVerify', position: 'bottom-left', size: 22 };
    case 'spacer':
      return { type: 'spacer', height: 6 };
    case 'watermark':
      return { type: 'watermark', text: 'ORIGINAL', opacity: 0.08 };
  }
}

/** A bulletin started from an empty page: the grades table it cannot be published without. */
export const blankBulletinLayout = () => ({
  format: 1,
  page: { size: 'A4', orientation: 'portrait' },
  theme: { font: 'NotoSans', fontSize: 10 },
  blocks: [
    newBlock('header', 'bulletin'),
    newBlock('infoGrid', 'bulletin'),
    newBlock('gradesTable', 'bulletin'),
    newBlock('signatures', 'bulletin'),
  ],
});
