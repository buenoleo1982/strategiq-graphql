import { AwsClient } from 'aws4fetch'
import { env } from '@/support/config'

const evidenceBucket = env.MINIO_BUCKET_NAME
const protocol = env.MINIO_USE_SSL ? 'https' : 'http'
const baseUrl = `${protocol}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`

const client = new AwsClient({
  accessKeyId: env.MINIO_ACCESS_KEY,
  secretAccessKey: env.MINIO_SECRET_KEY,
  service: 's3',
  region: 'us-east-1',
})

function encodeObjectKey(objectKey: string) {
  return objectKey
    .split('/')
    .map(part => encodeURIComponent(part))
    .join('/')
}

function buildBucketUrl() {
  return `${baseUrl}/${evidenceBucket}`
}

function buildObjectUrl(objectKey: string) {
  return `${buildBucketUrl()}/${encodeObjectKey(objectKey)}`
}

async function signedFetch(input: string, init?: RequestInit) {
  return client.fetch(input, init)
}

export class MinioStorageService {
  private static bucketReady = false

  static get bucketName() {
    return evidenceBucket
  }

  static async ensureEvidenceBucket() {
    if (this.bucketReady) {
      return
    }

    const existsResponse = await signedFetch(buildBucketUrl(), {
      method: 'HEAD',
    })

    if (existsResponse.status === 404) {
      const createResponse = await signedFetch(buildBucketUrl(), {
        method: 'PUT',
      })

      if (!createResponse.ok) {
        throw new Error(`Failed to create bucket: ${createResponse.status}`)
      }
    } else if (!existsResponse.ok) {
      throw new Error(`Failed to check bucket: ${existsResponse.status}`)
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

    const response = await signedFetch(buildObjectUrl(input.objectKey), {
      method: 'PUT',
      headers: {
        'Content-Type': input.contentType,
      },
      body: input.buffer,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload object: ${response.status}`)
    }
  }

  static async getObjectBuffer(objectKey: string) {
    const response = await signedFetch(buildObjectUrl(objectKey), {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch object: ${response.status}`)
    }

    return Buffer.from(await response.arrayBuffer())
  }

  static async removeObject(objectKey: string) {
    const response = await signedFetch(buildObjectUrl(objectKey), {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error(`Failed to delete object: ${response.status}`)
    }
  }
}
