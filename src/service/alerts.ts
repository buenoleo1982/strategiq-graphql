import type { PrismaClient } from '@prisma/client'

export type OperationalAlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM'

export type OperationalAlertRecord = {
  id: string
  severity: OperationalAlertSeverity
  title: string
  description: string
  href: string
  occurredAt: Date
}

const severityWeight: Record<OperationalAlertSeverity, number> = {
  CRITICAL: 3,
  HIGH: 2,
  MEDIUM: 1,
}

export async function resolveOperationalAlerts(prisma: PrismaClient) {
  const [indicators, nonConformities, correctiveActions] = await Promise.all([
    prisma.indicator.findMany({
      include: {
        entries: {
          orderBy: { collectedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.nonConformity.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    }),
    prisma.correctiveAction.findMany({
      include: {
        effectivenessChecks: {
          select: {
            id: true,
          },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    }),
  ])

  const now = Date.now()
  const alerts: OperationalAlertRecord[] = []

  for (const action of correctiveActions) {
    if (action.dueAt && !['COMPLETED', 'CANCELLED'].includes(action.status) && action.dueAt.getTime() < now) {
      alerts.push({
        id: `corrective-action-overdue-${action.id}`,
        severity: 'CRITICAL',
        title: 'Ação corretiva vencida',
        description: `${action.title} está com prazo vencido.`,
        href: `/non-conformities/${action.nonConformityId}/capa`,
        occurredAt: action.dueAt,
      })
    }

    if (action.status === 'COMPLETED' && !action.effectivenessChecks.length) {
      alerts.push({
        id: `corrective-action-no-check-${action.id}`,
        severity: 'MEDIUM',
        title: 'Ação concluída sem eficácia registrada',
        description: `${action.title} foi concluída, mas ainda não possui verificação de eficácia.`,
        href: `/non-conformities/${action.nonConformityId}/capa`,
        occurredAt: action.updatedAt,
      })
    }
  }

  for (const indicator of indicators) {
    const latestEntry = indicator.entries[0]

    if (!latestEntry || indicator.targetValue === null || indicator.targetValue === undefined) {
      continue
    }

    if (latestEntry.value < indicator.targetValue) {
      alerts.push({
        id: `indicator-below-target-${indicator.id}`,
        severity: 'HIGH',
        title: 'Indicador abaixo da meta',
        description: `${indicator.name} está abaixo da meta definida.`,
        href: `/indicators/${indicator.id}/entries`,
        occurredAt: latestEntry.collectedAt,
      })
    }
  }

  for (const nonConformity of nonConformities) {
    alerts.push({
      id: `non-conformity-open-${nonConformity.id}`,
      severity: 'MEDIUM',
      title: 'Não conformidade pendente',
      description: `${nonConformity.title} segue ${nonConformity.status === 'OPEN' ? 'aberta' : 'em andamento'}.`,
      href: `/non-conformities/${nonConformity.id}/edit`,
      occurredAt: nonConformity.updatedAt,
    })
  }

  return alerts.sort((left, right) => {
    const severityDelta = severityWeight[right.severity] - severityWeight[left.severity]
    if (severityDelta !== 0) {
      return severityDelta
    }

    return right.occurredAt.getTime() - left.occurredAt.getTime()
  })
}
