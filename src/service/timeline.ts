import type { PrismaClient } from '@prisma/client'
import { evidenceAuditInclude } from './evidences'

export type TimelineEventRecord = {
  id: string
  kind: 'CREATED' | 'UPDATED' | 'EVIDENCE_ADDED' | 'EVIDENCE_REMOVED' | 'EFFECTIVENESS_CHECKED'
  description: string
  actorName: string | null
  occurredAt: Date
}

type EvidenceAuditRecord = {
  id: number
  fileName: string
  label: string | null
  createdAt: Date
  deletedAt: Date | null
  uploadedBy?: { name: string | null } | null
  deletedBy?: { name: string | null } | null
}

type BaseTimelineEntity = {
  id: number
  createdAt: Date
  updatedAt: Date
  createdBy?: { name: string | null } | null
  updatedBy?: { name: string | null } | null
  evidences?: EvidenceAuditRecord[]
}

const buildEvidenceLabel = (evidence: EvidenceAuditRecord) => evidence.label || evidence.fileName

export function buildEntityTimeline(
  label: string,
  entity: BaseTimelineEntity,
  effectivenessChecks?: Array<{ id: number; checkedAt: Date }>
) {
  const events: TimelineEventRecord[] = [
    {
      id: `${label.toLowerCase()}-${entity.id}-created`,
      kind: 'CREATED',
      description: `${label} criado`,
      actorName: entity.createdBy?.name ?? null,
      occurredAt: entity.createdAt,
    },
  ]

  if (
    entity.updatedBy?.name &&
    entity.updatedAt.getTime() !== entity.createdAt.getTime()
  ) {
    events.push({
      id: `${label.toLowerCase()}-${entity.id}-updated`,
      kind: 'UPDATED',
      description: `${label} atualizado`,
      actorName: entity.updatedBy.name,
      occurredAt: entity.updatedAt,
    })
  }

  for (const evidence of entity.evidences ?? []) {
    events.push({
      id: `evidence-${evidence.id}-created`,
      kind: 'EVIDENCE_ADDED',
      description: `Evidência anexada: ${buildEvidenceLabel(evidence)}`,
      actorName: evidence.uploadedBy?.name ?? null,
      occurredAt: evidence.createdAt,
    })

    if (evidence.deletedAt) {
      events.push({
        id: `evidence-${evidence.id}-removed`,
        kind: 'EVIDENCE_REMOVED',
        description: `Evidência removida: ${buildEvidenceLabel(evidence)}`,
        actorName: evidence.deletedBy?.name ?? null,
        occurredAt: evidence.deletedAt,
      })
    }
  }

  for (const check of effectivenessChecks ?? []) {
    events.push({
      id: `effectiveness-${check.id}`,
      kind: 'EFFECTIVENESS_CHECKED',
      description: 'Verificação de eficácia registrada',
      actorName: null,
      occurredAt: check.checkedAt,
    })
  }

  return events.sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime())
}

export async function resolveStrategicObjectiveTimeline(prisma: PrismaClient, id: number) {
  const entity = await prisma.strategicObjective.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      evidences: {
        include: evidenceAuditInclude,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return buildEntityTimeline('Objetivo estratégico', entity)
}

export async function resolveInitiativeTimeline(prisma: PrismaClient, id: number) {
  const entity = await prisma.initiative.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      evidences: {
        include: evidenceAuditInclude,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return buildEntityTimeline('Iniciativa', entity)
}

export async function resolveIndicatorTimeline(prisma: PrismaClient, id: number) {
  const entity = await prisma.indicator.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      evidences: {
        include: evidenceAuditInclude,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return buildEntityTimeline('Indicador', entity)
}

export async function resolveNonConformityTimeline(prisma: PrismaClient, id: number) {
  const entity = await prisma.nonConformity.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      evidences: {
        include: evidenceAuditInclude,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return buildEntityTimeline('Não conformidade', entity)
}

export async function resolveCorrectiveActionTimeline(prisma: PrismaClient, id: number) {
  const entity = await prisma.correctiveAction.findUniqueOrThrow({
    where: { id },
    include: {
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      evidences: {
        include: evidenceAuditInclude,
        orderBy: { createdAt: 'desc' },
      },
      effectivenessChecks: {
        select: {
          id: true,
          checkedAt: true,
        },
        orderBy: { checkedAt: 'desc' },
      },
    },
  })

  return buildEntityTimeline('Ação corretiva', entity, entity.effectivenessChecks)
}
