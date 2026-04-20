import { GraphQLError } from 'graphql'
import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { createPerformanceLogger } from '@/lib/logger'
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

  const perfLogger = createPerformanceLogger('create-evidence', {
    traceId: ctx.traceId,
    userId: String(ctx.currentUser!.id),
    entityType: args.entityType,
    entityId: String(args.entityId),
  })

  ctx.logger.info(
    {
      entityType: args.entityType,
      entityId: args.entityId,
      fileName: args.fileName,
      contentType: args.contentType,
      base64Length: args.base64Data.length,
      hasLabel: Boolean(args.label?.trim()),
      userId: ctx.currentUser!.id,
    },
    'Iniciando upload de evidência via GraphQL'
  )

  try {
    await assertEvidenceTargetExists(ctx.prisma, args.entityType, args.entityId)
  } catch (error) {
    perfLogger.error(error as Error, {
      stage: 'target-validation',
      fileName: args.fileName,
    })
    ctx.logger.error(
      {
        error,
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
      },
      'Falha ao validar vínculo da evidência'
    )
    throw error
  }

  const buffer = decodeBase64Payload(args.base64Data)

  if (!buffer.length) {
    ctx.logger.warn(
      {
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
      },
      'Upload de evidência rejeitado por arquivo vazio ou inválido'
    )
    throw new GraphQLError('Arquivo vazio ou inválido')
  }

  const objectKey = buildEvidenceObjectKey({
    entityType: args.entityType,
    entityId: args.entityId,
    fileName: args.fileName,
  })

  try {
    ctx.logger.info(
      {
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
        objectKey,
        sizeBytes: buffer.length,
        bucket: MinioStorageService.bucketName,
      },
      'Enviando evidência para o storage'
    )

    await MinioStorageService.uploadObject({
      objectKey,
      buffer,
      contentType: args.contentType,
    })
  } catch (error) {
    perfLogger.error(error as Error, {
      stage: 'storage-upload',
      fileName: args.fileName,
      objectKey,
      sizeBytes: buffer.length,
      bucket: MinioStorageService.bucketName,
    })
    ctx.logger.error(
      {
        error,
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
        objectKey,
        sizeBytes: buffer.length,
        bucket: MinioStorageService.bucketName,
        minioEndpoint: process.env.MINIO_ENDPOINT,
        minioPort: process.env.MINIO_PORT,
      },
      'Falha ao enviar evidência para o storage'
    )

    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
      throw new GraphQLError('Storage de evidências indisponível no momento')
    }
    throw error
  }

  try {
    const evidence = await ctx.prisma.evidence.create({
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

    perfLogger.end({
      stage: 'db-create',
      evidenceId: evidence.id,
      objectKey,
    })
    ctx.logger.info(
      {
        evidenceId: evidence.id,
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
        objectKey,
      },
      'Evidência criada com sucesso'
    )

    return evidence
  } catch (error) {
    perfLogger.error(error as Error, {
      stage: 'db-create',
      fileName: args.fileName,
      objectKey,
    })
    ctx.logger.error(
      {
        error,
        entityType: args.entityType,
        entityId: args.entityId,
        fileName: args.fileName,
        objectKey,
      },
      'Falha ao persistir evidência no banco'
    )
    throw error
  }
}
