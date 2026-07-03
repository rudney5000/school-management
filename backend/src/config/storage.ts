import { env } from './env'
import {
    S3Client,
    HeadBucketCommand,
    CreateBucketCommand
} from '@aws-sdk/client-s3'

export const s3Client = new S3Client({
    region: 'us-east-1',
    endpoint: env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId:     env.MINIO_ROOT_USER,
        secretAccessKey: env.MINIO_ROOT_PASSWORD,
    },
})

export function getBucketName(subSchoolId: string): string {
    return `school-${subSchoolId}`
}

export async function ensureBucketExists(subSchoolId: string): Promise<string> {
    const bucketName = getBucketName(subSchoolId)

    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }))
        console.log(`✓ Bucket "${bucketName}" déjà présent`)
    } catch {
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }))
        console.log(`✓ Bucket "${bucketName}" créé`)
    }

    return bucketName
}