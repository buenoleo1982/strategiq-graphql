import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createNonConformity } from '@/graphql/resolvers/non-conformity/mutation/createNonConformity'
import { deleteNonConformity } from '@/graphql/resolvers/non-conformity/mutation/deleteNonConformity'
import { updateNonConformity } from '@/graphql/resolvers/non-conformity/mutation/updateNonConformity'
import { nonConformityGet } from '@/graphql/resolvers/non-conformity/query/nonConformityGet'
import { nonConformityLoad } from '@/graphql/resolvers/non-conformity/query/nonConformityLoad'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      nonConformity: {
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

describe('NonConformity resolvers', () => {
  it('should require authentication to create', async () => {
    const ctx = createContext(null)

    await expect(createNonConformity({}, { title: 'Ausência de evidência' }, ctx, {} as never)).rejects.toBeInstanceOf(
      GraphQLError
    )
  })

  it('should create non-conformity when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.nonConformity.create.mockResolvedValue({
      id: 1,
      title: 'Ausência de evidência',
      description: 'Checklist sem anexo obrigatório.',
      severity: 'HIGH',
      status: 'OPEN',
      source: 'Auditoria interna',
      department: 'Internação',
      occurredAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await createNonConformity(
      {},
      {
        title: 'Ausência de evidência',
        description: 'Checklist sem anexo obrigatório.',
        severity: 'HIGH',
        status: 'OPEN',
        source: 'Auditoria interna',
        department: 'Internação',
        ownerId: 1,
      },
      ctx,
      {} as never
    )

    expect(ctx.prisma.nonConformity.create).toHaveBeenCalled()
    expect(result).toMatchObject({
      title: 'Ausência de evidência',
      severity: 'HIGH',
      status: 'OPEN',
    })
  })

  it('should require authentication to load', async () => {
    const ctx = createContext(null)

    await expect(nonConformityLoad({}, {}, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should load non-conformities with pagination', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.services.pagination.getPagination.mockResolvedValue({
      page: 1,
      pageSize: 10,
      totalCount: 1,
      hasMore: false,
    })
    ctx.prisma.nonConformity.findMany.mockResolvedValue([
      {
        id: 1,
        title: 'Ausência de evidência',
        description: null,
        severity: 'HIGH',
        status: 'OPEN',
        source: 'Auditoria interna',
        department: 'Internação',
        occurredAt: new Date(),
        ownerId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await nonConformityLoad(
      {},
      {
        filterArgs: { title: 'Evidência' },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected nonConformityLoad result')
    }

    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(ctx.prisma.nonConformity.findMany).toHaveBeenCalled()
    expect(result.nodes ?? []).toHaveLength(1)
    expect(result.nodes?.[0]).toMatchObject({
      title: 'Ausência de evidência',
      severity: 'HIGH',
    })
  })

  it('should get non-conformity by id when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.nonConformity.findUnique.mockResolvedValue({
      id: 1,
      title: 'Ausência de evidência',
      description: null,
      severity: 'HIGH',
      status: 'OPEN',
      source: 'Auditoria interna',
      department: 'Internação',
      occurredAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await nonConformityGet({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected nonConformityGet result')
    }

    expect(result).toMatchObject({
      id: 1,
      title: 'Ausência de evidência',
    })
  })

  it('should update non-conformity when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.nonConformity.update.mockResolvedValue({
      id: 1,
      title: 'Ausência de evidência revisada',
      description: null,
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
      source: 'Auditoria interna',
      department: 'Internação',
      occurredAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateNonConformity(
      {},
      { id: 1, title: 'Ausência de evidência revisada', severity: 'CRITICAL', status: 'IN_PROGRESS' },
      ctx,
      {} as never
    )

    if (!result) {
      throw new Error('Expected updateNonConformity result')
    }

    expect(result).toMatchObject({
      title: 'Ausência de evidência revisada',
      severity: 'CRITICAL',
      status: 'IN_PROGRESS',
    })
  })

  it('should delete non-conformity when authenticated', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.nonConformity.delete.mockResolvedValue({
      id: 1,
      title: 'Ausência de evidência',
      description: null,
      severity: 'HIGH',
      status: 'OPEN',
      source: 'Auditoria interna',
      department: 'Internação',
      occurredAt: new Date(),
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteNonConformity({}, { id: 1 }, ctx, {} as never)

    if (!result) {
      throw new Error('Expected deleteNonConformity result')
    }

    expect(result).toMatchObject({
      id: 1,
      title: 'Ausência de evidência',
    })
  })
})
