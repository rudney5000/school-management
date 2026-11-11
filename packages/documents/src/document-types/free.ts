import { z } from 'zod';
import { defineDocumentType } from './define';

export const freePayload = z
  .object({
    school: z
      .object({ name: z.string().min(1), code: z.string().min(1), city: z.string().min(1) })
      .strict(),
    /** The values typed when issuing, by field key. Checked against the template's fields. */
    fields: z.record(z.string()),
  })
  .strict();

export type FreePayload = z.infer<typeof freePayload>;

/**
 * A document the school writes itself in the editor: certificate,
 * attestation, contract… Its text and its fields come from the template;
 * the backend only adds the school.
 */
export const freeDocument = defineDocumentType({
  key: 'free',
  subject: null,
  oneTemplatePerScope: false,
  manualFields: true,
  params: z.object({}).strict(),
  payload: freePayload,
  payloadVersion: 1,
  blocks: [
    'header',
    'title',
    'text',
    'richText',
    'image',
    'spacer',
    'signatures',
    'qrVerify',
    'watermark',
  ],
  requiredBlocks: ['richText'],
  numbering: { prefix: 'DOC', period: 'calendarYear' },
  publicView: (payload) => ({ schoolName: payload.school.name, holderName: null }),
  sample: {
    school: { name: 'Complexe Scolaire Saint-Joseph', code: 'SJG', city: 'Kinshasa' },
    fields: {},
  },
});
