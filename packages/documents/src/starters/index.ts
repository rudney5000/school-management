import type { DocumentTypeKey } from '../document-types/define';
import type { LayoutInput } from '../engine/layout';

/**
 * Starting points the team copies when a school asks for its first template.
 * They are only seeds: once copied, a template lives in the database and its
 * versions never change with these files.
 */
export interface Starter {
  key: string;
  name: string;
  documentType: DocumentTypeKey;
  layout: LayoutInput;
}

export const bulletinOfficielRdc: Starter = {
  key: 'bulletin-officiel-rdc',
  name: 'Officiel RDC',
  documentType: 'bulletin',
  layout: {
    format: 1,
    page: {
      size: 'A4',
      orientation: 'portrait',
      margins: { top: 12, right: 14, bottom: 14, left: 14 },
    },
    theme: { primary: '#1e3a5f', accent: '#c9a227', font: 'NotoSans', fontSize: 9.5 },
    blocks: [
      {
        type: 'header',
        band: true,
        align: 'center',
        lines: [
          { text: 'RÉPUBLIQUE DÉMOCRATIQUE DU CONGO', size: 8 },
          { text: "Ministère de l'Enseignement Primaire, Secondaire et Technique", size: 7.5 },
          { text: '{{school.name|upper}}', size: 15, bold: true },
          { text: 'Bulletin — {{period.name}} {{period.schoolYear}}', size: 10, color: 'accent' },
        ],
      },
      {
        type: 'infoGrid',
        columns: 2,
        band: true,
        items: [
          { label: 'Élève', value: '{{student.fullName}}' },
          { label: 'Classe', value: '{{class.name}}' },
          { label: 'Né(e) le', value: '{{student.birthDate|date|default:—}}' },
          { label: 'Niveau', value: '{{class.level}}' },
          { label: 'Matricule', value: '{{student.matricule|default:—}}' },
          { label: 'N°', value: '{{document.number}}' },
        ],
      },
      { type: 'spacer', height: 2 },
      {
        type: 'gradesTable',
        columns: ['course', 'score', 'max', 'coefficient', 'points'],
        showTotals: true,
        showRank: true,
      },
      {
        type: 'text',
        text: '**Mention :** {{mention|default:—}}   **Décision :** {{decision|default:—}}',
      },
      {
        type: 'signatures',
        place: 'Fait à {{school.city}}, le {{document.issuedAt|date}}',
        slots: [{ role: "Chef d'établissement", name: '{{school.headName|default:}}' }],
      },
      { type: 'qrVerify', position: 'bottom-left', size: 22 },
    ],
  },
};

export const STARTERS: readonly Starter[] = [bulletinOfficielRdc];
