import { describe, expect, it, vi } from 'vitest'
import { resolveOperationalAlerts } from '@/service/alerts'

describe('Alerts service', () => {
  it('should prioritize overdue actions, indicators below target and pending non-conformities', async () => {
    const prisma = {
      indicator: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 4,
            name: 'Tempo médio de resposta',
            targetValue: 5,
            entries: [{ value: 4, collectedAt: new Date('2026-04-21T10:00:00.000Z') }],
          },
        ]),
      },
      nonConformity: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 8,
            title: 'Checklist incompleto',
            status: 'OPEN',
            updatedAt: new Date('2026-04-21T09:00:00.000Z'),
          },
        ]),
      },
      correctiveAction: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 11,
            nonConformityId: 8,
            title: 'Revisar checklist',
            status: 'IN_PROGRESS',
            dueAt: new Date('2026-04-20T10:00:00.000Z'),
            updatedAt: new Date('2026-04-21T08:00:00.000Z'),
            effectivenessChecks: [],
          },
          {
            id: 12,
            nonConformityId: 8,
            title: 'Redistribuir responsáveis',
            status: 'COMPLETED',
            dueAt: null,
            updatedAt: new Date('2026-04-21T07:00:00.000Z'),
            effectivenessChecks: [],
          },
        ]),
      },
      risk: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 14,
            nonConformityId: 8,
            title: 'Risco de recorrência crítica',
            probability: 5,
            impact: 5,
            status: 'OPEN',
            updatedAt: new Date('2026-04-21T06:00:00.000Z'),
          },
        ]),
      },
      preventiveAction: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 22,
            title: 'Padronizar barreira preventiva',
            status: 'IN_PROGRESS',
            dueAt: new Date('2026-04-19T10:00:00.000Z'),
            updatedAt: new Date('2026-04-21T05:00:00.000Z'),
            risk: {
              nonConformityId: 8,
            },
          },
        ]),
      },
    } as any

    const alerts = await resolveOperationalAlerts(prisma)

    expect(alerts.map(alert => alert.id)).toEqual([
      'corrective-action-overdue-11',
      'indicator-below-target-4',
      'risk-critical-14',
      'preventive-action-overdue-22',
      'non-conformity-open-8',
      'corrective-action-no-check-12',
    ])
    expect(alerts[0]).toMatchObject({
      severity: 'CRITICAL',
      href: '/non-conformities/8/capa',
    })
    expect(alerts[1]).toMatchObject({
      severity: 'HIGH',
      href: '/indicators/4/entries',
    })
    expect(alerts[2]).toMatchObject({
      severity: 'HIGH',
      href: '/non-conformities/8/risks',
    })
  })
})
