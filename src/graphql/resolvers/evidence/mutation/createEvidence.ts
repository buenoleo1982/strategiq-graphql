import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { MinioStorageService } from '@/lib/storage/minio'
import {
  assertEvidenceTargetExists,
  buildEvidenceObjectKey,
  buildEvidenceTargetData,
  evidenceAuditInclude,
} from '@/service/evidences'

function decodeBase64Payload(base64Data: string) {
  try {
    return Buffer.from(base64Data, 'base64')
  } catch {
    throw new GraphQLError('Arquivo em formato inválido')
  }
}

export const createEvidence: FieldResolver<'Mutation', 'createEvidence'> = async (_, args, ctx) => {
  requireAuth(ctx)

  await assertEvidenceTargetExists(ctx.prisma, args.entityType, args.entityId)

  const buffer = decodeBase64Payload(args.base64Data)

  if (!buffer.length) {
    throw new GraphQLError('Arquivo vazio ou inválido')
  }

  const objectKey = buildEvidenceObjectKey({
    entityType: args.entityType,
    entityId: args.entityId,
    fileName: args.fileName,
  })

  try {
    await MinioStorageService.uploadObject({
      objectKey,
      buffer,
      contentType: args.contentType,
    })
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
      throw new GraphQLError('Storage de evidências indisponível no momento')
    }
    throw error
  }

  return ctx.prisma.evidence.create({
    data: {
      fileName: args.fileName,
      label: args.label?.trim() || null,
      objectKey,
      bucketName: MinioStorageService.bucketName,
      contentType: args.contentType,
      sizeBytes: buffer.length,
      uploadedById: ctx.currentUser!.id,
      ...buildEvidenceTargetData(args.entityType, args.entityId),
    },
    include: evidenceAuditInclude,
  })
}
