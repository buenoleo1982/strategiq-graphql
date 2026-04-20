import type { Prisma, PrismaClient } from '@prisma/client'
import { env } from '@/support/config'

export const evidenceEntityTypes = [
  'strategicObjective',
  'initiative',
  'indicator',
  'nonConformity',
  'correctiveAction',
] as const

export type EvidenceEntityType = (typeof evidenceEntityTypes)[number]

export function isEvidenceEntityType(value: string): value is EvidenceEntityType {
  return evidenceEntityTypes.includes(value as EvidenceEntityType)
}

export function buildEvidenceTargetData(entityType: EvidenceEntityType, entityId: number) {
  switch (entityType) {
    case 'strategicObjective':
      return { strategicObjectiveId: entityId }
    case 'initiative':
      return { initiativeId: entityId }
    case 'indicator':
      return { indicatorId: entityId }
    case 'nonConformity':
      return { nonConformityId: entityId }
    case 'correctiveAction':
      return { correctiveActionId: entityId }
  }
}

export async function assertEvidenceTargetExists(
  prisma: PrismaClient,
  entityType: EvidenceEntityType,
  entityId: number
) {
  switch (entityType) {
    case 'strategicObjective':
      return prisma.strategicObjective.findUniqueOrThrow({ where: { id: entityId } })
    case 'initiative':
      return prisma.initiative.findUniqueOrThrow({ where: { id: entityId } })
    case 'indicator':
      return prisma.indicator.findUniqueOrThrow({ where: { id: entityId } })
    case 'nonConformity':
      return prisma.nonConformity.findUniqueOrThrow({ where: { id: entityId } })
    case 'correctiveAction':
      return prisma.correctiveAction.findUniqueOrThrow({ where: { id: entityId } })
  }
}

export const evidenceAuditInclude = {
  uploadedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
    },
  },
  deletedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.EvidenceInclude

export function buildEvidenceWhere(filterArgs?: {
  id?: number | null
  strategicObjectiveId?: number | null
  initiativeId?: number | null
  indicatorId?: number | null
  nonConformityId?: number | null
  correctiveActionId?: number | null
  includeDeleted?: boolean | null
}) {
  const where: Prisma.EvidenceWhereInput = {
    ...(filterArgs?.includeDeleted ? {} : { deletedAt: null }),
    ...(filterArgs?.id ? { id: filterArgs.id } : {}),
    ...(filterArgs?.strategicObjectiveId
      ? { strategicObjectiveId: filterArgs.strategicObjectiveId }
      : {}),
    ...(filterArgs?.initiativeId ? { initiativeId: filterArgs.initiativeId } : {}),
    ...(filterArgs?.indicatorId ? { indicatorId: filterArgs.indicatorId } : {}),
    ...(filterArgs?.nonConformityId ? { nonConformityId: filterArgs.nonConformityId } : {}),
    ...(filterArgs?.correctiveActionId ? { correctiveActionId: filterArgs.correctiveActionId } : {}),
  }

  return where
}

export function buildEvidenceObjectKey(input: {
  entityType: EvidenceEntityType
  entityId: number
  fileName: string
}) {
  const sanitizedFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '-')
  return `${input.entityType}/${input.entityId}/${Date.now()}-${sanitizedFileName}`
}

export function buildEvidenceDownloadUrl(evidenceId: number) {
  return `http://localhost:${env.PORT}/uploads/evidences/${evidenceId}/download`
}
