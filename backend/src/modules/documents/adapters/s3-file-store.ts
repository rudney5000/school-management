import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { FileStore } from '@school-hub/documents';
import { BUCKET_NAME, s3Client } from '@/config/storage';

export class S3FileStore implements FileStore {
  async put(key: string, bytes: Uint8Array, mime: string) {
    await s3Client.send(
      new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, Body: bytes, ContentType: mime }),
    );
  }

  async get(key: string) {
    const object = await s3Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
    if (!object.Body) throw new Error(`Empty object ${key}`);
    return object.Body.transformToByteArray();
  }
}
