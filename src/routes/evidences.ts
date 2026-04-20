import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import multipart from '@fastify/multipart'
import { GraphQLError } from 'graphql'
import { AuthService } from '@/lib/auth/auth.service'
import { JWTService } from '@/lib/auth/jwt'
import { MinioStorageService } from '@/lib/storage/minio'
import { prisma } from '@/db'
import {
  assertEvidenceTargetExists,
  buildEvidenceObjectKey,
  buildEvidenceTargetData,
  isEvidenceEntityType,
  type EvidenceEntityType,
} from '@/service/evidences'

async function authenticateRequest(request: FastifyRequest) {
  const authHeader = request.headers.authorization || null
  const token = JWTService.extractTokenFromHeader(authHeader)

  if (!token) {
    throw new GraphQLError('Você precisa estar autenticado para enviar evidências')
  }

  return AuthService.validateAccessToken(token)
}

type UploadEvidenceBody = {
  entityType: EvidenceEntityType
  entityId: number
  label?: string
}

function extractMultipartField(
  field: Record<string, { value: unknown }> | undefined,
  key: string
) {
  return field?.[key]?.value
}

function parseUploadBody(fields: Record<string, { value: unknown }> | undefined): UploadEvidenceBody {
  const rawEntityType = extractMultipartField(fields, 'entityType')
  const rawEntityId = Number(extractMultipartField(fields, 'entityId'))
  const rawLabel = extractMultipartField(fields, 'label')

  if (typeof rawEntityType !== 'string' || !isEvidenceEntityType(rawEntityType)) {
    throw new GraphQLError('Tipo de vínculo de evidência inválido')
  }

  if (!Number.isInteger(rawEntityId) || rawEntityId <= 0) {
    throw new GraphQLError('Identificador do vínculo de evidência inválido')
  }

  return {
    entityType: rawEntityType,
    entityId: rawEntityId,
    label: typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim() : undefined,
  }
}

export async function uploadEvidenceHandler(request: FastifyRequest, reply: FastifyReply) {
  const currentUser = await authenticateRequest(request)

  if (!currentUser) {
    return reply.status(401).send({ message: 'Você precisa estar autenticado para enviar evidências' })
  }

  const filePart = await request.file()

  if (!filePart) {
    return reply.status(400).send({ message: 'Arquivo não enviado' })
  }

  const { entityType, entityId, label } = parseUploadBody(filePart.fields as Record<string, { value: unknown }>)

  await assertEvidenceTargetExists(prisma, entityType, entityId)

  const buffer = await filePart.toBuffer()
  const objectKey = buildEvidenceObjectKey({
    entityType,
    entityId,
    fileName: filePart.filename,
  })

  await MinioStorageService.uploadObject({
    objectKey,
    buffer,
    contentType: filePart.mimetype,
  })

  const evidence = await prisma.evidence.create({
    data: {
      fileName: filePart.filename,
      label,
      objectKey,
      bucketName: MinioStorageService.bucketName,
      contentType: filePart.mimetype,
      sizeBytes: buffer.length,
      uploadedById: currentUser.id,
      ...buildEvidenceTargetData(entityType, entityId),
    },
  })

  return reply.status(201).send({
    evidence,
  })
}

export async function downloadEvidenceHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  await authenticateRequest(request)

  const evidenceId = Number(request.params.id)

  if (!Number.isInteger(evidenceId) || evidenceId <= 0) {
    return reply.status(400).send({ message: 'Identificador de evidência inválido' })
  }

  const evidence = await prisma.evidence.findUnique({
    where: { id: evidenceId },
  })

  if (!evidence) {
    return reply.status(404).send({ message: 'Evidência não encontrada' })
  }

  const objectStream = await MinioStorageService.getObjectStream(evidence.objectKey)

  reply.header('Content-Type', evidence.contentType)
  reply.header('Content-Disposition', `inline; filename="${evidence.fileName}"`)

  return reply.send(objectStream)
}

export async function registerEvidenceRoutes(app: FastifyInstance) {
  await app.register(multipart, {
    limits: {
      files: 1,
      fileSize: 15 * 1024 * 1024,
    },
  })

  app.post('/uploads/evidences', uploadEvidenceHandler)
  app.get('/uploads/evidences/:id/download', downloadEvidenceHandler)
}
