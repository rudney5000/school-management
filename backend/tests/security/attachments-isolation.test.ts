import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '@/app';
import { db } from '@/db';
import { attachments, conversations, messages, reports } from '@/db/schema';
import { ChatService } from '@/modules/chat/chat.service';
import { bearer } from '../setup/auth';
import {
  createSubSchool,
  createTenant,
  createUser,
  createWorker,
  type Tenant,
} from '../setup/factories';

const app = createApp();

/** A director backed by a worker record, as real accounts are. */
async function directorIn(tenant: Tenant, subSchoolId: string) {
  const worker = await createWorker(subSchoolId);
  const user = await createUser('director', { workerId: worker.id });
  return bearer({
    id: user.id,
    email: user.email ?? undefined,
    role: 'director',
    schoolId: tenant.schoolId,
    subSchoolId,
  });
}

async function createReport(tenant: Tenant) {
  const [report] = await db
    .insert(reports)
    .values({
      schoolId: tenant.schoolId,
      subSchoolId: tenant.subSchoolId,
      reporterRole: 'parent',
      category: 'behavior',
      description: 'Test report',
    })
    .returning();
  return report;
}

const pdf = { filename: 'evidence.pdf', mimeType: 'application/pdf', size: 1024 };

describe('attachment uploads', () => {
  let tenant: Tenant;

  beforeEach(async () => {
    tenant = await createTenant();
  });

  describe('report evidence', () => {
    it('lets a director of the report sub-school attach a file', async () => {
      const report = await createReport(tenant);
      const director = await directorIn(tenant, tenant.subSchoolId);

      const presign = await request(app)
        .post('/api/attachments/presign')
        .set('Authorization', director)
        .send({ ...pdf, attachableType: 'report', attachableId: report.id })
        .expect(200);

      expect(presign.body.data.key).toMatch(
        new RegExp(`^schools/${tenant.subSchoolId}/reports/${report.id}/[0-9a-f-]{36}\\.pdf$`),
      );

      await request(app)
        .post('/api/attachments/confirm')
        .set('Authorization', director)
        .send({
          ...pdf,
          attachableType: 'report',
          attachableId: report.id,
          category: 'report_evidence',
          key: presign.body.data.key,
          width: 1,
          height: 1,
        })
        .expect(201);
    });

    it('refuses a director of another sub-school', async () => {
      const report = await createReport(tenant);
      const otherSubSchool = await createSubSchool(tenant.schoolId);
      const otherDirector = await directorIn(tenant, otherSubSchool);

      await request(app)
        .post('/api/attachments/presign')
        .set('Authorization', otherDirector)
        .send({ ...pdf, attachableType: 'report', attachableId: report.id })
        .expect(403);

      await request(app)
        .get('/api/attachments')
        .query({ attachableType: 'report', attachableId: report.id })
        .set('Authorization', otherDirector)
        .expect(403);
    });
  });

  describe('validate and reject', () => {
    it('refuse a director of another sub-school', async () => {
      const report = await createReport(tenant);
      const [file] = await db
        .insert(attachments)
        .values({
          attachableType: 'report',
          attachableId: report.id,
          category: 'report_evidence',
          key: `schools/${tenant.subSchoolId}/reports/${report.id}/${crypto.randomUUID()}.pdf`,
          filename: 'evidence.pdf',
          mimeType: 'application/pdf',
          size: 1024,
          uploadedBy: crypto.randomUUID(),
        })
        .returning();

      const otherDirector = await directorIn(tenant, await createSubSchool(tenant.schoolId));
      await request(app)
        .patch(`/api/attachments/${file.id}/validate`)
        .set('Authorization', otherDirector)
        .expect(403);
      await request(app)
        .patch(`/api/attachments/${file.id}/reject`)
        .set('Authorization', otherDirector)
        .send({ reason: 'Not genuine' })
        .expect(403);

      const director = await directorIn(tenant, tenant.subSchoolId);
      await request(app)
        .patch(`/api/attachments/${file.id}/validate`)
        .set('Authorization', director)
        .expect(200);
    });
  });

  describe('confirm', () => {
    it('refuses a key that presign did not issue for this record', async () => {
      const report = await createReport(tenant);
      const director = await directorIn(tenant, tenant.subSchoolId);
      const foreignSubSchool = crypto.randomUUID();

      for (const key of [
        `schools/${foreignSubSchool}/enrollments/${crypto.randomUUID()}/${crypto.randomUUID()}.pdf`,
        `schools/${tenant.subSchoolId}/reports/${report.id}/../../other/${crypto.randomUUID()}.pdf`,
        `schools/${tenant.subSchoolId}/reports/${report.id}/whatever.pdf`,
      ]) {
        await request(app)
          .post('/api/attachments/confirm')
          .set('Authorization', director)
          .send({
            ...pdf,
            attachableType: 'report',
            attachableId: report.id,
            category: 'report_evidence',
            key,
            width: 1,
            height: 1,
          })
          .expect(400);
      }
    });
  });

  describe('chat attachments', () => {
    it('refuses a key outside the conversation folder', async () => {
      const sender = await createUser('teacher');
      const [conversation] = await db
        .insert(conversations)
        .values({ type: 'group', subSchoolId: tenant.subSchoolId, createdBy: sender.id })
        .returning();
      const [message] = await db
        .insert(messages)
        .values({ conversationId: conversation.id, senderId: sender.id, content: 'hi' })
        .returning();

      const chat = new ChatService();
      const file = { filename: 'x.pdf', mimeType: 'application/pdf', size: 10 };

      await expect(
        chat.saveAttachments(message.id, sender.id, [
          { ...file, key: `schools/${crypto.randomUUID()}/payments/x/${crypto.randomUUID()}.pdf` },
        ]),
      ).rejects.toMatchObject({ statusCode: 400 });

      await expect(
        chat.saveAttachments(message.id, sender.id, [
          {
            ...file,
            key: `schools/${tenant.subSchoolId}/conversations/${conversation.id}/${crypto.randomUUID()}.pdf`,
          },
        ]),
      ).resolves.toBeUndefined();
    });
  });
});
