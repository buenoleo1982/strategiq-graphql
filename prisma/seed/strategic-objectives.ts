import type { PrismaClient } from '@prisma/client'

export async function seedStrategicObjectives(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({
    where: {
      email: 'demo@demo.com',
    },
  })

  const objectives = await prisma.strategicObjective.createManyAndReturn({
    data: [
      {
        title: 'Elevar prontidao para auditorias ONA',
        description: 'Organizar trilhas, evidencias e ritos para reduzir retrabalho antes da avaliacao.',
        status: 'ACTIVE',
        priority: 'HIGH',
        ownerId: admin?.id ?? null,
        createdById: admin?.id ?? null,
        updatedById: admin?.id ?? null,
      },
      {
        title: 'Reduzir tempo de resposta para nao conformidades',
        description: 'Criar uma operacao mais previsivel para tratativa e acompanhamento das pendencias.',
        status: 'DRAFT',
        priority: 'MEDIUM',
        ownerId: admin?.id ?? null,
        createdById: admin?.id ?? null,
        updatedById: admin?.id ?? null,
      },
    ],
  })

  return objectives
}
