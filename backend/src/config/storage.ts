import { env } from './env'
import { S3Client, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId:     env.MINIO_ROOT_USER,
        secretAccessKey: env.MINIO_ROOT_PASSWORD,
    },
})

export const BUCKET_NAME = env.MINIO_BUCKET_NAME

export async function ensureBucketExists(): Promise<void> {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
        console.log(`✓ Bucket "${BUCKET_NAME}" déjà présent`)
    } catch {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
        console.log(`✓ Bucket "${BUCKET_NAME}" créé`)
    }
}