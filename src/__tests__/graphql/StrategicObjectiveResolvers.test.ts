import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createStrategicObjective } from '@/graphql/resolvers/strategic-objective/mutation/createStrategicObjective'
import { deleteStrategicObjective } from '@/graphql/resolvers/strategic-objective/mutation/deleteStrategicObjective'
import { updateStrategicObjective } from '@/graphql/resolvers/strategic-objective/mutation/updateStrategicObjective'
import { strategicObjectiveGet } from '@/graphql/resolvers/strategic-objective/query/strategicObjectiveGet'
import { strategicObjectiveLoad } from '@/graphql/resolvers/strategic-objective/query/strategicObjectiveLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      strategicObjective: {
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

describe('StrategicObjective resolvers', () => {
  it('should require authentication to create', async () => {
    const ctx = createContext(null)

    await expect(
      createStrategicObjective({}, { title: 'Expand quality program' }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create strategic objective when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.strategicObjective.create.mockResolvedValue({
      id: 1,
      title: 'Expand quality program',
      description: '2026 hospital objective',
      status: 'ACTIVE',
      priority: 'HIGH',
      startsAt: null,
      endsAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createStrategicObjective(
      {},
      {
        title: 'Expand quality program',
        description: '2026 hospital objective',
        status: 'ACTIVE',
        priority: 'HIGH',
        ownerId: 1,
      },
      ctx,
      {} as never
    )

    expect(ctx.prisma.strategicObjective.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        title: 'Expand quality program',
        status: 'ACTIVE',
        priority: 'HIGH',
        ownerId: 1,
        createdById: 1,
      }),
    }))
    expect(result).toMatchObject({
      title: 'Expand quality program',
      status: 'ACTIVE',
      priority: 'HIGH',
    })
  })

  it('should require authentication to load', async () => {
    const ctx = createContext(null)

    await expect(strategicObjectiveLoad({}, {}, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should load strategic objectives with pagination', async () => {
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
    ctx.prisma.strategicObjective.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Expand quality program',
        description: null,
        status: 'ACTIVE',
        priority: 'HIGH',
        startsAt: null,
        endsAt: null,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await strategicObjectiveLoad(
      {},
      {
        filterArgs: { title: 'quality' },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected strategicObjectiveLoad result')
    }
    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(ctx.prisma.strategicObjective.findMany).toHaveBeenCalled()
    expect(result.nodes).toHaveLength(1)
  })

  it('should get strategic objective by id when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.strategicObjective.findUnique.mockResolvedValue({
      id: 1,
      title: 'Expand quality program',
      description: null,
      status: 'ACTIVE',
      priority: 'HIGH',
      startsAt: null,
      endsAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await strategicObjectiveGet({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected strategicObjectiveGet result')
    }
    expect(result).toMatchObject({
      id: 1,
      title: 'Expand quality program',
    })
  })

  it('should update strategic objective when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.strategicObjective.update.mockResolvedValue({
      id: 1,
      title: 'Updated objective',
      description: null,
      status: 'COMPLETED',
      priority: 'HIGH',
      startsAt: null,
      endsAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateStrategicObjective(
      {},
      { id: 1, title: 'Updated objective', status: 'COMPLETED' },
      ctx,
      {} as never
    )

    expect(ctx.prisma.strategicObjective.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 1 },
      data: expect.objectContaining({
        title: 'Updated objective',
        status: 'COMPLETED',
        updatedById: 1,
      }),
    }))
    if (!result) {
      throw new Error('Expected updateStrategicObjective result')
    }
    expect(result).toMatchObject({
      title: 'Updated objective',
      status: 'COMPLETED',
    })
  })

  it('should delete strategic objective when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.strategicObjective.delete.mockResolvedValue({
      id: 1,
      title: 'Objective',
      description: null,
      status: 'ARCHIVED',
      priority: 'LOW',
      startsAt: null,
      endsAt: null,
      ownerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteStrategicObjective({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected deleteStrategicObjective result')
    }
    expect(result).toMatchObject({
      id: 1,
      status: 'ARCHIVED',
    })
  })
})
