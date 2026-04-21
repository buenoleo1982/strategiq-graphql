import type { PrismaClient } from '@prisma/client'

export async function seedNonConformities(prisma: PrismaClient) {
  const qualityManager = await prisma.user.findFirst({
    where: {
      role: 'QUALITY_MANAGER',
    },
  })

  return prisma.nonConformity.createManyAndReturn({
    data: [
      {
        title: 'Evidência obrigatória ausente no processo de internação',
        description: 'Foi identificada ausência de evidência atualizada no checklist do processo.',
        severity: 'HIGH',
        status: 'OPEN',
        source: 'Auditoria interna',
        department: 'Internação',
        occurredAt: new Date('2026-04-10T09:00:00.000Z'),
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
      {
        title: 'Tempo acima da meta na tratativa de não conformidades',
        description: 'O prazo médio de resposta ultrapassou o limite esperado no mês vigente.',
        severity: 'MEDIUM',
        status: 'IN_PROGRESS',
        source: 'Indicador assistencial',
        department: 'Qualidade',
        occurredAt: new Date('2026-04-14T14:30:00.000Z'),
        ownerId: qualityManager?.id ?? null,
        createdById: qualityManager?.id ?? null,
        updatedById: qualityManager?.id ?? null,
      },
    ],
  })
}
