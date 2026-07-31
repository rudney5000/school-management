import {
    and,
    eq
} from 'drizzle-orm';
import { db } from '@/db';
import {
    users,
    workers
} from '@/db/schema';
import { AppError } from '@/shared/errors/app-error';
import type {
    ConfirmSignatureImageDto,
    CreateWorkerDto,
    PresignSignatureImageDto,
    UpdateWorkerDto
} from './workers.schema';
import {
    BUCKET_NAME,
    buildObjectKey,
    s3Client
} from "@/config/storage";
import {randomUUID} from "crypto";
import {PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

export type WorkerRecord = typeof workers.$inferSelect;

export class WorkersService {
  async findAll(subSchoolId: string): Promise<WorkerRecord[]> {
    return db
      .select()
      .from(workers)
      .where(eq(workers.subSchoolId, subSchoolId));
  }

  async findById(id: string, subSchoolId: string): Promise<WorkerRecord> {
    const [worker] = await db
      .select()
      .from(workers)
      .where(
        and(
          eq(workers.id, id),
          eq(workers.subSchoolId, subSchoolId),
        ),
      );

    if (!worker) {
      throw new AppError('NOT_FOUND', 'Employé introuvable', 404);
    }

    return worker;
  }

  async create(input: CreateWorkerDto): Promise<WorkerRecord> {
    const [worker] = await db
      .insert(workers)
      .values({
        userId: input.userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        jobTitle: input.jobTitle,
        subSchoolId: input.subSchoolId,
      })
      .returning();

    return worker;
  }

  async update(
    id: string,
    subSchoolId: string,
    input: UpdateWorkerDto,
  ): Promise<WorkerRecord> {
    await this.findById(id, subSchoolId);

    const [worker] = await db
      .update(workers)
      .set({
        ...input,
      })
      .where(
        and(
          eq(workers.id, id),
          eq(workers.subSchoolId, subSchoolId),
        ),
      )
      .returning();

    return worker;
  }

  async remove(id: string, subSchoolId: string): Promise<void> {
    await this.findById(id, subSchoolId);
    await db.delete(workers).where(
      and(
        eq(workers.id, id),
        eq(workers.subSchoolId, subSchoolId),
      ),
    );
  }

    async presignSignatureImage(workerId: string, subSchoolId: string, input: PresignSignatureImageDto) {
        const worker = await this.findById(workerId, subSchoolId);

        const extension = input.filename.split('.').pop();
        const key = buildObjectKey(worker.subSchoolId, 'signatures', `${randomUUID()}.${extension}`);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: input.mimeType,
            ContentLength: input.size,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
        return { uploadUrl, key };
    }

    async confirmSignatureImage(workerId: string, subSchoolId: string, input: ConfirmSignatureImageDto) {
        await this.findById(workerId, subSchoolId);

        const [updated] = await db
            .update(workers)
            .set({ signatureImageKey: input.key })
            .where(eq(workers.id, workerId))
            .returning();

        return updated;
    }

    async findWorkerIdByUserId(userId: string): Promise<string> {
        const [row] = await db
            .select({ workerId: users.workerId })
            .from(users)
            .where(eq(users.id, userId));

        if (!row?.workerId) {
            throw new AppError('NOT_FOUND', "Aucun profil employé associé à cet utilisateur", 404);
        }

        return row.workerId;
    }
}
