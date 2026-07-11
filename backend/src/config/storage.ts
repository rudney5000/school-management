import { env } from './env'
import {
    GetObjectCommand,
    S3Client
} from '@aws-sdk/client-s3'
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";

export const s3Client = new S3Client({
    region: 'us-east-005',
    endpoint: env.MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId:     env.MINIO_ROOT_USER,
        secretAccessKey: env.MINIO_ROOT_PASSWORD,
    },
})

export const BUCKET_NAME = env.MINIO_BUCKET_NAME

export function buildObjectKey(subSchoolId: string, ...pathParts: string[]): string {
    return `schools/${subSchoolId}/${pathParts.join('/')}`
}

export async function getAttachmentUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key })
    return getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1h
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