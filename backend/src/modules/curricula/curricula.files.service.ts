import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { and, count, eq, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { attachments } from '@/db/schema';
import {
  BUCKET_NAME,
  isUploadKeyIn,
  newUploadKey,
  s3Client,
  uploadKeyPrefix,
} from '@/config/storage';
import { AppError } from '@/shared/errors/app-error';
import { isUniqueViolation } from '@/shared/utils/pg-errors';
import { filesOf, findAccessibleCurriculum } from './curricula.access';
import type { ConfirmCurriculumFileDto, PresignCurriculumFileDto } from './curricula.schema';
import type {
  CurriculumFile,
  CurriculumViewer,
  PresignedUpload,
  SignedDownload,
} from './curricula.types';

const SIGNED_URL_TTL_SECONDS = 300;

const fileColumns = {
  id: attachments.id,
  filename: attachments.filename,
  mimeType: attachments.mimeType,
  size: attachments.size,
  createdAt: attachments.createdAt,
};

const fileNotFound = (): AppError => new AppError('NOT_FOUND', 'Fichier introuvable', 404);

function fileKeyPrefix(subSchoolId: string, curriculumId: string): string {
  return uploadKeyPrefix(subSchoolId, 'curriculum', curriculumId);
}

/** The files of a programme: S3 objects, recorded as `attachments` rows. */
export class CurriculumFilesService {
  async list(curriculumId: string): Promise<CurriculumFile[]> {
    return db
      .select(fileColumns)
      .from(attachments)
      .where(filesOf(curriculumId))
      .orderBy(attachments.createdAt);
  }

  /** How many files each of these programmes has. */
  async countByCurriculum(curriculumIds: string[]): Promise<Map<string, number>> {
    if (curriculumIds.length === 0) return new Map();

    const rows = await db
      .select({ curriculumId: attachments.attachableId, total: count() })
      .from(attachments)
      .where(
        and(
          eq(attachments.attachableType, 'curriculum'),
          inArray(attachments.attachableId, curriculumIds),
        ),
      )
      .groupBy(attachments.attachableId);

    return new Map(rows.map((row) => [row.curriculumId, row.total]));
  }

  async presign(
    id: string,
    subSchoolId: string,
    input: PresignCurriculumFileDto,
  ): Promise<PresignedUpload> {
    await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    const key = newUploadKey(fileKeyPrefix(subSchoolId, id), input.mimeType);
    const uploadUrl = await getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: input.mimeType,
        ContentLength: input.size,
      }),
      { expiresIn: SIGNED_URL_TTL_SECONDS },
    );

    return { uploadUrl, key };
  }

  async confirm(
    id: string,
    subSchoolId: string,
    userId: string,
    input: ConfirmCurriculumFileDto,
  ): Promise<CurriculumFile> {
    await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    // The key and type come back from the client: they must match what presign
    // issued for this programme, or a director could attach another school's
    // file, or record a Word file as a PDF.
    if (!isUploadKeyIn(input.key, fileKeyPrefix(subSchoolId, id), input.mimeType)) {
      throw new AppError('VALIDATION_ERROR', 'Clé de fichier invalide', 400);
    }

    try {
      const [record] = await db
        .insert(attachments)
        .values({
          attachableType: 'curriculum',
          attachableId: id,
          category: 'curriculum',
          key: input.key,
          filename: input.filename,
          mimeType: input.mimeType,
          size: input.size,
          uploadedBy: userId,
          // Uploaded by the school's own management: nothing left to validate.
          status: 'validated',
          validatedBy: userId,
          validatedAt: new Date(),
        })
        .returning(fileColumns);

      return record;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError('CONFLICT', 'Ce fichier est déjà enregistré', 409);
      }
      throw error;
    }
  }

  async remove(id: string, attachmentId: string, subSchoolId: string): Promise<void> {
    await findAccessibleCurriculum(id, { kind: 'manager', subSchoolId });

    const [removed] = await db
      .delete(attachments)
      .where(and(filesOf(id), eq(attachments.id, attachmentId)))
      .returning({ key: attachments.key });

    if (!removed) throw fileNotFound();

    await this.deleteObjects([removed.key]);
  }

  async downloadUrl(
    id: string,
    attachmentId: string,
    viewer: CurriculumViewer,
  ): Promise<SignedDownload> {
    await findAccessibleCurriculum(id, viewer);

    const [file] = await db
      .select({ key: attachments.key, filename: attachments.filename })
      .from(attachments)
      .where(and(filesOf(id), eq(attachments.id, attachmentId)))
      .limit(1);

    if (!file) throw fileNotFound();

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: file.key,
        ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      }),
      { expiresIn: SIGNED_URL_TTL_SECONDS },
    );

    return { url, filename: file.filename, expiresIn: SIGNED_URL_TTL_SECONDS };
  }

  /** Best effort: the rows are already gone, so a leftover object is only wasted space. */
  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map(async (key) => {
        try {
          await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
        } catch (error) {
          console.error(`[curricula] Failed to delete S3 object ${key}`, error);
        }
      }),
    );
  }
}
