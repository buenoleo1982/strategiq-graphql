import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createIndicatorEntry } from '@/graphql/resolvers/indicator-entry/mutation/createIndicatorEntry'
import { deleteIndicatorEntry } from '@/graphql/resolvers/indicator-entry/mutation/deleteIndicatorEntry'
import { updateIndicatorEntry } from '@/graphql/resolvers/indicator-entry/mutation/updateIndicatorEntry'
import { indicatorEntryGet } from '@/graphql/resolvers/indicator-entry/query/indicatorEntryGet'
import { indicatorEntryLoad } from '@/graphql/resolvers/indicator-entry/query/indicatorEntryLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      indicatorEntry: {
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

describe('IndicatorEntry resolvers', () => {
  it('should require authentication to create', async () => {
    const ctx = createContext(null)

    await expect(
      createIndicatorEntry({}, { indicatorId: 1, value: 3.2 }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create indicator entry when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicatorEntry.create.mockResolvedValue({
      id: 1,
      indicatorId: 1,
      value: 3.2,
      collectedAt: new Date(),
      source: 'Coleta manual',
      notes: 'Apurado na reunião semanal',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createIndicatorEntry(
      {},
      {
        indicatorId: 1,
        value: 3.2,
        source: 'Coleta manual',
        notes: 'Apurado na reunião semanal',
      },
      ctx,
      {} as never
    )

    expect(ctx.prisma.indicatorEntry.create).toHaveBeenCalled()
    expect(result).toMatchObject({
      indicatorId: 1,
      value: 3.2,
    })
  })

  it('should require authentication to load', async () => {
    const ctx = createContext(null)

    await expect(indicatorEntryLoad({}, {}, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should load indicator entries with pagination', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.services.pagination.getPagination.mockResolvedValue({
      page: 1,
      pageSize: 10,
      totalCount: 1,
      hasMore: false,
    })
    ctx.prisma.indicatorEntry.findMany.mockResolvedValue([
      {
        id: 1,
        indicatorId: 1,
        value: 3.2,
        collectedAt: new Date(),
        source: 'Coleta manual',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await indicatorEntryLoad(
      {},
      {
        filterArgs: { indicatorId: 1 },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected indicatorEntryLoad result')
    }
    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(ctx.prisma.indicatorEntry.findMany).toHaveBeenCalled()
    expect(result.nodes).toHaveLength(1)
  })

  it('should get indicator entry by id when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicatorEntry.findUnique.mockResolvedValue({
      id: 1,
      indicatorId: 1,
      value: 3.2,
      collectedAt: new Date(),
      source: 'Coleta manual',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await indicatorEntryGet({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected indicatorEntryGet result')
    }
    expect(result).toMatchObject({
      id: 1,
      indicatorId: 1,
    })
  })

  it('should update indicator entry when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicatorEntry.update.mockResolvedValue({
      id: 1,
      indicatorId: 1,
      value: 2.9,
      collectedAt: new Date(),
      source: 'Coleta manual',
      notes: 'Valor revisado',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateIndicatorEntry(
      {},
      { id: 1, value: 2.9, notes: 'Valor revisado' },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected updateIndicatorEntry result')
    }
    expect(result).toMatchObject({
      value: 2.9,
      notes: 'Valor revisado',
    })
  })

  it('should delete indicator entry when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicatorEntry.delete.mockResolvedValue({
      id: 1,
      indicatorId: 1,
      value: 3.2,
      collectedAt: new Date(),
      source: 'Coleta manual',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteIndicatorEntry({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected deleteIndicatorEntry result')
    }
    expect(result).toMatchObject({
      id: 1,
      indicatorId: 1,
    })
  })
})
