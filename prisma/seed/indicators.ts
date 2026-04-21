import type { PrismaClient } from '@prisma/client'

export async function seedIndicators(prisma: PrismaClient) {
  const admin = await prisma.user.findFirst({
    where: {
      email: 'demo@demo.com',
    },
  })

  return prisma.indicator.createManyAndReturn({
    data: [
      {
        name: 'Tempo médio para tratativa de não conformidades',
        description: 'Acompanha o tempo entre o registro da não conformidade e o início da tratativa.',
        formula: 'soma_dias_tratativa / quantidade_nc',
        unit: 'dias',
        targetValue: 5,
        frequency: 'MONTHLY',
        ownerId: admin?.id ?? null,
        createdById: admin?.id ?? null,
        updatedById: admin?.id ?? null,
      },
      {
        name: 'Conformidade de evidências por processo',
        description: 'Monitora o percentual de processos com evidências obrigatórias atualizadas.',
        formula: '(processos_conformes / processos_monitorados) * 100',
        unit: '%',
        targetValue: 95,
        frequency: 'MONTHLY',
        ownerId: admin?.id ?? null,
        createdById: admin?.id ?? null,
        updatedById: admin?.id ?? null,
      },
    ],
  })
}
