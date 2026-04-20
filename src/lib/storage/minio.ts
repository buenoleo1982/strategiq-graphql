import { env } from '@/support/config'
import { Client } from 'minio'

const evidenceBucket = env.MINIO_BUCKET_NAME

const client = new Client({
  endPoint: env.MINIO_ENDPOINT,
  port: env.MINIO_PORT,
  useSSL: env.MINIO_USE_SSL,
  accessKey: env.MINIO_ACCESS_KEY,
  secretKey: env.MINIO_SECRET_KEY,
})

export class MinioStorageService {
  private static bucketReady = false

  static get bucketName() {
    return evidenceBucket
  }

  static async ensureEvidenceBucket() {
    if (this.bucketReady) {
      return
    }

    const exists = await client.bucketExists(evidenceBucket)

    if (!exists) {
      await client.makeBucket(evidenceBucket)
    }

    this.bucketReady = true
  }

  static async warmupEvidenceBucket() {
    try {
      await this.ensureEvidenceBucket()
      return true
    } catch {
      return false
    }
  }

  static async uploadObject(input: {
    objectKey: string
    buffer: Buffer
    contentType: string
  }) {
    await this.ensureEvidenceBucket()

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
