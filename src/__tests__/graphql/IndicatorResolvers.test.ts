import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createIndicator } from '@/graphql/resolvers/indicator/mutation/createIndicator'
import { deleteIndicator } from '@/graphql/resolvers/indicator/mutation/deleteIndicator'
import { updateIndicator } from '@/graphql/resolvers/indicator/mutation/updateIndicator'
import { indicatorGet } from '@/graphql/resolvers/indicator/query/indicatorGet'
import { indicatorLoad } from '@/graphql/resolvers/indicator/query/indicatorLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      indicator: {
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

describe('Indicator resolvers', () => {
  it('should require authentication to create', async () => {
    const ctx = createContext(null)

    await expect(createIndicator({}, { name: 'Tempo medio' }, ctx, {} as never)).rejects.toBeInstanceOf(
      GraphQLError
    )
  })

  it('should create indicator when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicator.create.mockResolvedValue({
      id: 1,
      name: 'Tempo medio',
      description: 'Tempo medio de tratativa',
      formula: 'total_dias / total_nc',
      unit: 'dias',
      targetValue: 5,
      frequency: 'MONTHLY',
      ownerId: 1,
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createIndicator(
      {},
      {
        name: 'Tempo medio',
        description: 'Tempo medio de tratativa',
        formula: 'total_dias / total_nc',
        unit: 'dias',
        targetValue: 5,
        frequency: 'MONTHLY',
        ownerId: 1,
      },
      ctx,
      {} as never
    )

    expect(ctx.prisma.indicator.create).toHaveBeenCalled()
    expect(result).toMatchObject({
      name: 'Tempo medio',
      frequency: 'MONTHLY',
      targetValue: 5,
    })
  })

  it('should require authentication to load', async () => {
    const ctx = createContext(null)

    await expect(indicatorLoad({}, {}, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should load indicators with pagination', async () => {
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
    ctx.prisma.indicator.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Tempo medio',
        description: null,
        formula: null,
        unit: 'dias',
        targetValue: 5,
        frequency: 'MONTHLY',
        ownerId: 1,
        entries: [
          {
            id: 11,
            indicatorId: 1,
            value: 6,
            collectedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await indicatorLoad(
      {},
      {
        filterArgs: { name: 'Tempo' },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected indicatorLoad result')
    }
    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(ctx.prisma.indicator.findMany).toHaveBeenCalled()
    expect(result.nodes ?? []).toHaveLength(1)
    expect(result.nodes?.[0]).toMatchObject({
      targetValue: 5,
    })
  })

  it('should get indicator by id when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicator.findUnique.mockResolvedValue({
      id: 1,
      name: 'Tempo medio',
      description: null,
      formula: null,
      unit: 'dias',
      targetValue: 5,
      frequency: 'MONTHLY',
      ownerId: 1,
      entries: [
        {
          id: 11,
          indicatorId: 1,
          value: 6,
          collectedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await indicatorGet({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected indicatorGet result')
    }
    expect(result).toMatchObject({
      id: 1,
      name: 'Tempo medio',
    })
  })

  it('should update indicator when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicator.update.mockResolvedValue({
      id: 1,
      name: 'Tempo medio revisado',
      description: null,
      formula: null,
      unit: 'dias',
      targetValue: 4,
      frequency: 'MONTHLY',
      ownerId: 1,
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateIndicator(
      {},
      { id: 1, name: 'Tempo medio revisado', targetValue: 4 },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected updateIndicator result')
    }
    expect(result).toMatchObject({
      name: 'Tempo medio revisado',
      targetValue: 4,
    })
  })

  it('should delete indicator when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.indicator.delete.mockResolvedValue({
      id: 1,
      name: 'Tempo medio',
      description: null,
      formula: null,
      unit: 'dias',
      targetValue: 5,
      frequency: 'MONTHLY',
      ownerId: null,
      entries: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteIndicator({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected deleteIndicator result')
    }
    expect(result).toMatchObject({
      id: 1,
      name: 'Tempo medio',
    })
  })
})
