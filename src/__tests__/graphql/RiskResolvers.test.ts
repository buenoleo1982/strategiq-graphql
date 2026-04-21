import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createPreventiveAction } from '@/graphql/resolvers/risk/mutation/createPreventiveAction'
import { createRisk } from '@/graphql/resolvers/risk/mutation/createRisk'
import { deletePreventiveAction } from '@/graphql/resolvers/risk/mutation/deletePreventiveAction'
import { deleteRisk } from '@/graphql/resolvers/risk/mutation/deleteRisk'
import { updatePreventiveAction } from '@/graphql/resolvers/risk/mutation/updatePreventiveAction'
import { updateRisk } from '@/graphql/resolvers/risk/mutation/updateRisk'
import { preventiveActionGet } from '@/graphql/resolvers/risk/query/preventiveActionGet'
import { preventiveActionLoad } from '@/graphql/resolvers/risk/query/preventiveActionLoad'
import { riskGet } from '@/graphql/resolvers/risk/query/riskGet'
import { riskLoad } from '@/graphql/resolvers/risk/query/riskLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      risk: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      preventiveAction: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
    services: {
      pagination: {
        getPagination: vi.fn(),
      },
    },
  }) as any

describe('Risk resolvers', () => {
  it('should require authentication to create risk', async () => {
    const ctx = createContext(null)
    await expect(
      createRisk({}, { nonConformityId: 1, title: 'Risco', probability: 3, impact: 3 }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create risk when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.risk.create.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Risco de recorrência',
      description: 'O problema pode voltar a ocorrer.',
      category: 'Processo',
      probability: 4,
      impact: 5,
      status: 'OPEN',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createRisk(
      {},
      {
        nonConformityId: 1,
        title: 'Risco de recorrência',
        description: 'O problema pode voltar a ocorrer.',
        category: 'Processo',
        probability: 4,
        impact: 5,
      },
      ctx,
      {} as never
    )

    expect(result).toMatchObject({ nonConformityId: 1, title: 'Risco de recorrência', status: 'OPEN' })
  })

  it('should load risks with pagination', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.services.pagination.getPagination.mockResolvedValue({ page: 1, pageSize: 10, totalCount: 1, hasMore: false })
    ctx.prisma.risk.findMany.mockResolvedValue([
      {
        id: 1,
        nonConformityId: 1,
        title: 'Risco de recorrência',
        description: null,
        category: 'Processo',
        probability: 3,
        impact: 4,
        status: 'OPEN',
        dueAt: null,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await riskLoad({}, { filterArgs: { nonConformityId: 1 }, pageArgs: { skip: 0, take: 10 } }, ctx, {} as never)

    expect(result?.nodes ?? []).toHaveLength(1)
  })

  it('should get, update and delete risk when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.risk.findUnique.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Risco de recorrência',
      description: null,
      category: 'Processo',
      probability: 4,
      impact: 4,
      status: 'OPEN',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.risk.update.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Risco revisado',
      description: null,
      category: 'Processo',
      probability: 2,
      impact: 5,
      status: 'MONITORING',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.risk.delete.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Risco revisado',
      description: null,
      category: 'Processo',
      probability: 2,
      impact: 5,
      status: 'MONITORING',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fetched = await riskGet({}, { id: 1 }, ctx, {} as never)
    const updated = await updateRisk({}, { id: 1, title: 'Risco revisado', status: 'MONITORING', probability: 2, impact: 5 }, ctx, {} as never)
    const deleted = await deleteRisk({}, { id: 1 }, ctx, {} as never)

    expect(fetched).toMatchObject({ id: 1, title: 'Risco de recorrência' })
    expect(updated).toMatchObject({ title: 'Risco revisado', status: 'MONITORING' })
    expect(deleted).toMatchObject({ id: 1 })
  })

  it('should require authentication to create preventive action', async () => {
    const ctx = createContext(null)
    await expect(
      createPreventiveAction({}, { riskId: 1, title: 'Ação' }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create preventive action when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.preventiveAction.create.mockResolvedValue({
      id: 1,
      riskId: 1,
      title: 'Reforçar treinamento',
      description: 'Padronizar a orientação preventiva.',
      status: 'OPEN',
      dueAt: null,
      completedAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createPreventiveAction(
      {},
      { riskId: 1, title: 'Reforçar treinamento', description: 'Padronizar a orientação preventiva.' },
      ctx,
      {} as never
    )

    expect(result).toMatchObject({ riskId: 1, title: 'Reforçar treinamento', status: 'OPEN' })
  })

  it('should load preventive actions with pagination', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.services.pagination.getPagination.mockResolvedValue({ page: 1, pageSize: 10, totalCount: 1, hasMore: false })
    ctx.prisma.preventiveAction.findMany.mockResolvedValue([
      {
        id: 1,
        riskId: 1,
        title: 'Reforçar treinamento',
        description: null,
        status: 'IN_PROGRESS',
        dueAt: null,
        completedAt: null,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await preventiveActionLoad({}, { filterArgs: { riskId: 1 }, pageArgs: { skip: 0, take: 10 } }, ctx, {} as never)
    expect(result?.nodes ?? []).toHaveLength(1)
  })

  it('should get, update and delete preventive action when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.preventiveAction.findUnique.mockResolvedValue({
      id: 1,
      riskId: 1,
      title: 'Reforçar treinamento',
      description: null,
      status: 'OPEN',
      dueAt: null,
      completedAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.preventiveAction.update.mockResolvedValue({
      id: 1,
      riskId: 1,
      title: 'Treinamento revisado',
      description: null,
      status: 'COMPLETED',
      dueAt: null,
      completedAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.preventiveAction.delete.mockResolvedValue({
      id: 1,
      riskId: 1,
      title: 'Treinamento revisado',
      description: null,
      status: 'COMPLETED',
      dueAt: null,
      completedAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fetched = await preventiveActionGet({}, { id: 1 }, ctx, {} as never)
    const updated = await updatePreventiveAction({}, { id: 1, title: 'Treinamento revisado', status: 'COMPLETED' }, ctx, {} as never)
    const deleted = await deletePreventiveAction({}, { id: 1 }, ctx, {} as never)

    expect(fetched).toMatchObject({ id: 1, title: 'Reforçar treinamento' })
    expect(updated).toMatchObject({ title: 'Treinamento revisado', status: 'COMPLETED' })
    expect(deleted).toMatchObject({ id: 1 })
  })
})
