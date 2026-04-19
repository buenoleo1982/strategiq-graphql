import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createCorrectiveAction } from '@/graphql/resolvers/capa/mutation/createCorrectiveAction'
import { createEffectivenessCheck } from '@/graphql/resolvers/capa/mutation/createEffectivenessCheck'
import { deleteCorrectiveAction } from '@/graphql/resolvers/capa/mutation/deleteCorrectiveAction'
import { deleteEffectivenessCheck } from '@/graphql/resolvers/capa/mutation/deleteEffectivenessCheck'
import { updateCorrectiveAction } from '@/graphql/resolvers/capa/mutation/updateCorrectiveAction'
import { updateEffectivenessCheck } from '@/graphql/resolvers/capa/mutation/updateEffectivenessCheck'
import { correctiveActionGet } from '@/graphql/resolvers/capa/query/correctiveActionGet'
import { correctiveActionLoad } from '@/graphql/resolvers/capa/query/correctiveActionLoad'
import { effectivenessCheckGet } from '@/graphql/resolvers/capa/query/effectivenessCheckGet'
import { effectivenessCheckLoad } from '@/graphql/resolvers/capa/query/effectivenessCheckLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      correctiveAction: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
      effectivenessCheck: {
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

describe('Capa resolvers', () => {
  it('should require authentication to create corrective action', async () => {
    const ctx = createContext(null)
    await expect(
      createCorrectiveAction({}, { nonConformityId: 1, title: 'Plano' }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create corrective action when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.correctiveAction.create.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Plano',
      description: 'Ação corretiva inicial',
      status: 'OPEN',
      dueAt: new Date(),
      completedAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createCorrectiveAction(
      {},
      { nonConformityId: 1, title: 'Plano', description: 'Ação corretiva inicial' },
      ctx,
      {} as never
    )

    expect(result).toMatchObject({ nonConformityId: 1, title: 'Plano', status: 'OPEN' })
  })

  it('should load corrective actions with pagination', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.services.pagination.getPagination.mockResolvedValue({ page: 1, pageSize: 10, totalCount: 1, hasMore: false })
    ctx.prisma.correctiveAction.findMany.mockResolvedValue([
      {
        id: 1,
        nonConformityId: 1,
        title: 'Plano',
        description: null,
        status: 'IN_PROGRESS',
        dueAt: new Date(),
        completedAt: null,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await correctiveActionLoad({}, { filterArgs: { nonConformityId: 1 }, pageArgs: { skip: 0, take: 10 } }, ctx, {} as never)

    expect(result?.nodes ?? []).toHaveLength(1)
  })

  it('should get, update and delete corrective action when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.correctiveAction.findUnique.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Plano',
      description: null,
      status: 'OPEN',
      dueAt: new Date(),
      completedAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.correctiveAction.update.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Plano revisado',
      description: null,
      status: 'COMPLETED',
      dueAt: new Date(),
      completedAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.correctiveAction.delete.mockResolvedValue({
      id: 1,
      nonConformityId: 1,
      title: 'Plano revisado',
      description: null,
      status: 'COMPLETED',
      dueAt: new Date(),
      completedAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fetched = await correctiveActionGet({}, { id: 1 }, ctx, {} as never)
    const updated = await updateCorrectiveAction({}, { id: 1, title: 'Plano revisado', status: 'COMPLETED' }, ctx, {} as never)
    const deleted = await deleteCorrectiveAction({}, { id: 1 }, ctx, {} as never)

    expect(fetched).toMatchObject({ id: 1, title: 'Plano' })
    expect(updated).toMatchObject({ title: 'Plano revisado', status: 'COMPLETED' })
    expect(deleted).toMatchObject({ id: 1 })
  })

  it('should require authentication to create effectiveness check', async () => {
    const ctx = createContext(null)
    await expect(
      createEffectivenessCheck({}, { correctiveActionId: 1, result: 'EFFECTIVE' }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create effectiveness check when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.effectivenessCheck.create.mockResolvedValue({
      id: 1,
      correctiveActionId: 1,
      checkedAt: new Date(),
      result: 'EFFECTIVE',
      notes: 'Funcionou',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createEffectivenessCheck(
      {},
      { correctiveActionId: 1, result: 'EFFECTIVE', notes: 'Funcionou' },
      ctx,
      {} as never
    )

    expect(result).toMatchObject({ correctiveActionId: 1, result: 'EFFECTIVE' })
  })

  it('should load effectiveness checks with pagination', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.services.pagination.getPagination.mockResolvedValue({ page: 1, pageSize: 10, totalCount: 1, hasMore: false })
    ctx.prisma.effectivenessCheck.findMany.mockResolvedValue([
      {
        id: 1,
        correctiveActionId: 1,
        checkedAt: new Date(),
        result: 'EFFECTIVE',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await effectivenessCheckLoad({}, { filterArgs: { correctiveActionId: 1 }, pageArgs: { skip: 0, take: 10 } }, ctx, {} as never)
    expect(result?.nodes ?? []).toHaveLength(1)
  })

  it('should get, update and delete effectiveness check when authenticated', async () => {
    const ctx = createContext({ id: 1, email: 'quality@example.com', name: 'Quality', role: 'QUALITY_MANAGER' })
    ctx.prisma.effectivenessCheck.findUnique.mockResolvedValue({
      id: 1,
      correctiveActionId: 1,
      checkedAt: new Date(),
      result: 'EFFECTIVE',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.effectivenessCheck.update.mockResolvedValue({
      id: 1,
      correctiveActionId: 1,
      checkedAt: new Date(),
      result: 'NEEDS_MONITORING',
      notes: 'Acompanhar por mais 30 dias',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    ctx.prisma.effectivenessCheck.delete.mockResolvedValue({
      id: 1,
      correctiveActionId: 1,
      checkedAt: new Date(),
      result: 'NEEDS_MONITORING',
      notes: 'Acompanhar por mais 30 dias',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fetched = await effectivenessCheckGet({}, { id: 1 }, ctx, {} as never)
    const updated = await updateEffectivenessCheck({}, { id: 1, result: 'NEEDS_MONITORING', notes: 'Acompanhar por mais 30 dias' }, ctx, {} as never)
    const deleted = await deleteEffectivenessCheck({}, { id: 1 }, ctx, {} as never)

    expect(fetched).toMatchObject({ id: 1, result: 'EFFECTIVE' })
    expect(updated).toMatchObject({ result: 'NEEDS_MONITORING' })
    expect(deleted).toMatchObject({ id: 1 })
  })
})
