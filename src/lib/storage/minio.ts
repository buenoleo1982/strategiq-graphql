import { Client } from 'minio'
import { env } from '@/support/config'

const evidenceBucket = env.MINIO_BUCKET_NAME

const client = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
})

export class MinioStorageService {
  static get bucketName() {
    return evidenceBucket
  }

  static async ensureEvidenceBucket() {
    const exists = await client.bucketExists(evidenceBucket)

    if (!exists) {
      await client.makeBucket(evidenceBucket)
    }
  }

  static async uploadObject(input: {
    objectKey: string
    buffer: Buffer
    contentType: string
  }) {
    await client.putObject(evidenceBucket, input.objectKey, input.buffer, input.buffer.length, {
      'Content-Type': input.contentType,
    })
  }

  static getObjectStream(objectKey: string) {
    return client.getObject(evidenceBucket, objectKey)
  }

  static async removeObject(objectKey: string) {
    await client.removeObject(evidenceBucket, objectKey)
  }
}
