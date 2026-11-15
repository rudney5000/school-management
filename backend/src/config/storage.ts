import { randomUUID } from 'crypto';
import { env } from './env';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: 'us-east-005',
  endpoint: env.MINIO_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: env.MINIO_ROOT_USER,
    secretAccessKey: env.MINIO_ROOT_PASSWORD,
  },
});

export const BUCKET_NAME = env.MINIO_BUCKET_NAME;

export function buildObjectKey(subSchoolId: string, ...pathParts: string[]): string {
  return `schools/${subSchoolId}/${pathParts.join('/')}`;
}

/** The folder every upload for one record goes in: `schools/<sub-school>/<type>s/<id>/`. */
export function uploadKeyPrefix(
  subSchoolId: string,
  attachableType: string,
  attachableId: string,
): string {
  return buildObjectKey(subSchoolId, `${attachableType}s`, attachableId, '');
}

/** The file extension each accepted upload type is stored under. */
export const UPLOAD_EXTENSIONS = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
} as const;

export type UploadMimeType = keyof typeof UPLOAD_EXTENSIONS;

const UPLOAD_OBJECT_NAME = /^[0-9a-f-]{36}\.([a-z0-9]{2,5})$/;

/** A fresh object key in `prefix`: a random UUID named after the file's type, never its name. */
export function newUploadKey(prefix: string, mimeType: UploadMimeType): string {
  return `${prefix}${randomUUID()}.${UPLOAD_EXTENSIONS[mimeType]}`;
}

/**
 * Whether `key` is one the server could have presigned in `prefix` for a file
 * of `mimeType`: a random UUID object name directly inside that folder, with
 * that type's extension. Upload keys and types come back from the client, so
 * anything else may point at another school's file or lie about its type.
 */
export function isUploadKeyIn(key: string, prefix: string, mimeType: string): boolean {
  if (!key.startsWith(prefix)) return false;

  const match = UPLOAD_OBJECT_NAME.exec(key.slice(prefix.length));
  const expected = (UPLOAD_EXTENSIONS as Record<string, string | undefined>)[mimeType];
  return !!match && !!expected && match[1] === expected;
}

export async function getAttachmentUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1h
}
// export function getBucketName(subSchoolId: string): string {
//     return `school-${subSchoolId}`
// }
//
// export async function ensureBucketExists(subSchoolId: string): Promise<string> {
//     const bucketName = getBucketName(subSchoolId)
//
//     try {
//         await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
//         console.log(`✓ Bucket "${bucketName}" déjà présent`)
//     } catch {
//         await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
//         console.log(`✓ Bucket "${bucketName}" créé`)
//     }
//
//     return bucketName
// }
