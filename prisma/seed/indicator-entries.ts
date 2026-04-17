import type { PrismaClient } from '@prisma/client'

export async function seedIndicatorEntries(prisma: PrismaClient) {
  const indicators = await prisma.indicator.findMany({
    orderBy: {
      id: 'asc',
    },
  })

  if (!indicators.length) {
    return []
  }

  return prisma.indicatorEntry.createManyAndReturn({
    data: [
      {
        indicatorId: indicators[0]!.id,
        value: 4.2,
        source: 'Coleta manual',
        notes: 'Primeira medição de referência do catálogo.',
      },
      {
        indicatorId: indicators[0]!.id,
        value: 3.8,
        source: 'Coleta manual',
        notes: 'Evolução após ajuste do fluxo.',
      },
      {
        indicatorId: indicators[1] ? indicators[1]!.id : indicators[0]!.id,
        value: 96,
        source: 'Importação interna',
        notes: 'Percentual apurado na revisão mensal.',
      },
    ],
  })
}
