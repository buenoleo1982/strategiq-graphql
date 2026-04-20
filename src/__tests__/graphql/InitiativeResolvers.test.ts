import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createInitiative } from '@/graphql/resolvers/initiative/mutation/createInitiative'
import { deleteInitiative } from '@/graphql/resolvers/initiative/mutation/deleteInitiative'
import { updateInitiative } from '@/graphql/resolvers/initiative/mutation/updateInitiative'
import { initiativeGet } from '@/graphql/resolvers/initiative/query/initiativeGet'
import { initiativeLoad } from '@/graphql/resolvers/initiative/query/initiativeLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      initiative: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
      },
    },
    services: {
      pagination: {
        getPagination: vi.fn(),
      },
    },
  }) as any

describe('Initiative resolvers', () => {
  it('should require authentication to create', async () => {
    const ctx = createContext(null)

    await expect(
      createInitiative({}, { strategicObjectiveId: 1, title: 'Launch weekly review' }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should create initiative when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.initiative.create.mockResolvedValue({
      id: 1,
      strategicObjectiveId: 1,
      title: 'Launch weekly review',
      description: 'Weekly planning ritual',
      status: 'IN_PROGRESS',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createInitiative(
      {},
      {
        strategicObjectiveId: 1,
        title: 'Launch weekly review',
        description: 'Weekly planning ritual',
        status: 'IN_PROGRESS',
        ownerId: 1,
      },
      ctx,
      {} as never
    )

    expect(ctx.prisma.initiative.create).toHaveBeenCalled()
    expect(result).toMatchObject({
      title: 'Launch weekly review',
      status: 'IN_PROGRESS',
    })
  })

  it('should load initiatives with pagination', async () => {
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
    ctx.prisma.initiative.findMany.mockResolvedValue([
      {
        id: 1,
        strategicObjectiveId: 1,
        title: 'Launch weekly review',
        description: null,
        status: 'PLANNED',
        dueAt: null,
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await initiativeLoad(
      {},
      {
        filterArgs: { title: 'review' },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(result?.nodes).toHaveLength(1)
  })

  it('should get initiative by id when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.initiative.findUnique.mockResolvedValue({
      id: 1,
      strategicObjectiveId: 1,
      title: 'Launch weekly review',
      description: null,
      status: 'PLANNED',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await initiativeGet({}, { id: 1 }, ctx, {} as never)

    expect(result).toMatchObject({
      id: 1,
      title: 'Launch weekly review',
    })
  })

  it('should update initiative when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.initiative.update.mockResolvedValue({
      id: 1,
      strategicObjectiveId: 1,
      title: 'Updated initiative',
      description: null,
      status: 'COMPLETED',
      dueAt: null,
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateInitiative({}, { id: 1, title: 'Updated initiative', status: 'COMPLETED' }, ctx, {} as never)

    expect(result).toMatchObject({
      title: 'Updated initiative',
      status: 'COMPLETED',
    })
  })

  it('should delete initiative when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'manager@example.com',
      name: 'Manager',
      role: 'MANAGER',
    })

    ctx.prisma.initiative.delete.mockResolvedValue({
      id: 1,
      strategicObjectiveId: 1,
      title: 'Initiative',
      description: null,
      status: 'COMPLETED',
      dueAt: null,
      ownerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteInitiative({}, { id: 1 }, ctx, {} as never)

    expect(result).toMatchObject({
      id: 1,
      status: 'COMPLETED',
    })
  })
})
