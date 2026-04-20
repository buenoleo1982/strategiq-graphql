import type { PrismaClient } from '@prisma/client'

export async function seedInitiatives(prisma: PrismaClient) {
  const manager = await prisma.user.findFirst({
    where: {
      role: 'MANAGER',
    },
  })

  const objectives = await prisma.strategicObjective.findMany({
    orderBy: {
      id: 'asc',
    },
    take: 2,
  })

  return prisma.initiative.createManyAndReturn({
    data: [
      {
        strategicObjectiveId: objectives[0]?.id ?? 1,
        title: 'Mapear evidências críticas por capítulo',
        description: 'Organizar evidências por requisito para acelerar a preparação da auditoria.',
        status: 'IN_PROGRESS',
        dueAt: new Date('2026-05-15T18:00:00.000Z'),
        ownerId: manager?.id ?? null,
      },
      {
        strategicObjectiveId: objectives[1]?.id ?? 1,
        title: 'Definir rito semanal de acompanhamento das NCs',
        description: 'Estruturar cadência de acompanhamento para manter o SLA de tratativa.',
        status: 'PLANNED',
        dueAt: new Date('2026-05-08T18:00:00.000Z'),
        ownerId: manager?.id ?? null,
      },
    ],
  })
}
