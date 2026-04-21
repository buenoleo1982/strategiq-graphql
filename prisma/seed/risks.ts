import type { PrismaClient } from '@prisma/client'

export async function seedRisks(prisma: PrismaClient) {
  const qualityManager = await prisma.user.findFirst({
    where: {
      role: 'QUALITY_MANAGER',
    },
  })

  const nonConformities = await prisma.nonConformity.findMany({
    orderBy: {
      id: 'asc',
    },
    take: 2,
  })

  const risks = await prisma.risk.createManyAndReturn({
    data: [
      {
        nonConformityId: nonConformities[0]?.id ?? 1,
        title: 'Recorrência do desvio por checklist desatualizado',
        description: 'Sem revisão do checklist, o processo pode repetir a mesma falha.',
        category: 'Processo',
        probability: 4,
        impact: 5,
        status: 'OPEN',
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
      {
        nonConformityId: nonConformities[0]?.id ?? 1,
        title: 'Treinamento inconsistente entre turnos',
        description: 'Turnos diferentes podem aplicar regras divergentes de conferência.',
        category: 'Pessoas',
        probability: 3,
        impact: 4,
        status: 'MONITORING',
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
    ],
  })

  const preventiveActions = await prisma.preventiveAction.createManyAndReturn({
    data: [
      {
        riskId: risks[0]?.id ?? 1,
        title: 'Revisar checklist e aprovar nova versão',
        description: 'Submeter checklist a revisão formal e comunicar a mudança.',
        status: 'IN_PROGRESS',
        dueAt: new Date('2026-04-30T18:00:00.000Z'),
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
      {
        riskId: risks[1]?.id ?? 1,
        title: 'Padronizar reciclagem entre turnos',
        description: 'Aplicar orientação única em todos os turnos assistenciais.',
        status: 'OPEN',
        dueAt: new Date('2026-05-05T18:00:00.000Z'),
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
    ],
  })

  return {
    risks,
    preventiveActions,
  }
}
