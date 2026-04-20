import { MinioStorageService } from '@/lib/storage/minio'
import { buildEvidenceObjectKey } from '@/service/evidences'
import type { PrismaClient } from '@prisma/client'

export async function seedEvidences(prisma: PrismaClient) {
  await MinioStorageService.ensureEvidenceBucket()

  const nonConformity = await prisma.nonConformity.findFirst({
    orderBy: { id: 'asc' },
  })

  const correctiveAction = await prisma.correctiveAction.findFirst({
    orderBy: { id: 'asc' },
  })

  const manager = await prisma.user.findFirst({
    where: { role: 'QUALITY_MANAGER' },
  })

  if (!nonConformity || !correctiveAction) {
    return []
  }

  const records = [
    {
      entityType: 'nonConformity' as const,
      entityId: nonConformity.id,
      fileName: 'plano-auditoria.txt',
      label: 'Plano de auditoria relacionado',
      content: 'Evidência inicial vinculada à não conformidade para ambiente de desenvolvimento.',
      nonConformityId: nonConformity.id,
      correctiveActionId: null,
    },
    {
      entityType: 'correctiveAction' as const,
      entityId: correctiveAction.id,
      fileName: 'checklist-acao.txt',
      label: 'Checklist da ação corretiva',
      content: 'Checklist operacional da ação corretiva para validar o fluxo CAPA.',
      nonConformityId: null,
      correctiveActionId: correctiveAction.id,
    },
  ]

  const evidences = []

  for (const record of records) {
    const buffer = Buffer.from(record.content, 'utf-8')
    const objectKey = buildEvidenceObjectKey({
      entityType: record.entityType,
      entityId: record.entityId,
      fileName: record.fileName,
    })

    await MinioStorageService.uploadObject({
      objectKey,
      buffer,
      contentType: 'text/plain',
    })

    const evidence = await prisma.evidence.create({
      data: {
        fileName: record.fileName,
        label: record.label,
        objectKey,
        bucketName: MinioStorageService.bucketName,
        contentType: 'text/plain',
        sizeBytes: buffer.length,
        uploadedById: manager?.id ?? null,
        ...(record.nonConformityId ? { nonConformityId: record.nonConformityId } : {}),
        ...(record.correctiveActionId ? { correctiveActionId: record.correctiveActionId } : {}),
      },
    })

    evidences.push(evidence)
  }

  return evidences
}
