import type { PrismaClient } from '@prisma/client'

export async function seedCapas(prisma: PrismaClient) {
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

  const actions = await prisma.correctiveAction.createManyAndReturn({
    data: [
      {
        nonConformityId: nonConformities[0]?.id ?? 1,
        title: 'Revisar checklist e anexos obrigatórios',
        description: 'Atualizar o roteiro do processo e reforçar conferência de evidências.',
        status: 'IN_PROGRESS',
        dueAt: new Date('2026-04-25T18:00:00.000Z'),
        ownerId: qualityManager?.id ?? null,
      },
      {
        nonConformityId: nonConformities[1]?.id ?? 1,
        title: 'Redistribuir responsáveis pela tratativa das NCs',
        description: 'Revisar capacidade do time para cumprir o SLA de resposta.',
        status: 'COMPLETED',
        dueAt: new Date('2026-04-20T18:00:00.000Z'),
        completedAt: new Date('2026-04-18T16:00:00.000Z'),
        ownerId: qualityManager?.id ?? null,
      },
    ],
  })

  const effectivenessChecks = await prisma.effectivenessCheck.createManyAndReturn({
    data: [
      {
        correctiveActionId: actions[1]?.id ?? 1,
        checkedAt: new Date('2026-04-19T09:00:00.000Z'),
        result: 'EFFECTIVE',
        notes: 'O tempo médio voltou ao intervalo esperado após redistribuição.',
      },
    ],
  })

  return {
    actions,
    effectivenessChecks,
  }
}
