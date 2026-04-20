import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { deleteEvidence } from '@/graphql/resolvers/evidence/mutation/deleteEvidence'
import { updateEvidence } from '@/graphql/resolvers/evidence/mutation/updateEvidence'
import { evidenceLoad } from '@/graphql/resolvers/evidence/query/evidenceLoad'
import { MinioStorageService } from '@/lib/storage/minio'

vi.mock('@/lib/storage/minio', () => ({
  MinioStorageService: {
    removeObject: vi.fn(),
  },
}))

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      evidence: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
    },
    services: {
      pagination: {
        getPagination: vi.fn(),
      },
    },
  }) as any

describe('Evidence resolvers', () => {
  it('should require authentication to load evidences', async () => {
    const ctx = createContext(null)

    await expect(
      evidenceLoad({}, { filterArgs: { nonConformityId: 1 }, pageArgs: { skip: 0, take: 10 } }, ctx, {} as never)
    ).rejects.toBeInstanceOf(GraphQLError)
  })

  it('should load evidences with filters and pagination', async () => {
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
    ctx.prisma.evidence.findMany.mockResolvedValue([
      {
        id: 1,
        fileName: 'plano-auditoria.txt',
        label: 'Plano',
        objectKey: 'nonConformity/1/plano-auditoria.txt',
        bucketName: 'evidences',
        contentType: 'text/plain',
        sizeBytes: 120,
        uploadedById: 1,
        uploadedBy: { id: 1, name: 'Quality' },
        updatedById: null,
        updatedBy: null,
        deletedById: null,
        deletedBy: null,
        deletedAt: null,
        nonConformityId: 1,
        correctiveActionId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ])

    const result = await evidenceLoad(
      {},
      {
        filterArgs: { nonConformityId: 1 },
        pageArgs: { skip: 0, take: 10 },
      },
      ctx,
      {} as never
    )

    expect(ctx.services.pagination.getPagination).toHaveBeenCalled()
    expect(ctx.prisma.evidence.findMany).toHaveBeenCalled()
    if (!result) {
      throw new Error('Expected evidenceLoad result')
    }
    expect(result.nodes).toHaveLength(1)
  })

  it('should delete evidence and remove object from storage', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.evidence.findFirst.mockResolvedValue({
      id: 3,
      fileName: 'checklist.txt',
      objectKey: 'correctiveAction/2/checklist.txt',
    })
    ctx.prisma.evidence.update.mockResolvedValue({
      id: 3,
      fileName: 'checklist.txt',
      label: 'Checklist',
      objectKey: 'correctiveAction/2/checklist.txt',
      bucketName: 'evidences',
      contentType: 'text/plain',
      sizeBytes: 80,
      uploadedById: 1,
      uploadedBy: { id: 1, name: 'Quality' },
      updatedById: null,
      updatedBy: null,
      deletedById: 1,
      deletedBy: { id: 1, name: 'Quality' },
      deletedAt: new Date(),
      nonConformityId: null,
      correctiveActionId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await deleteEvidence({}, { id: 3 }, ctx, {} as never)

    expect(MinioStorageService.removeObject).toHaveBeenCalledWith('correctiveAction/2/checklist.txt')
    if (!result) {
      throw new Error('Expected deleteEvidence result')
    }

    expect(result.id).toBe(3)
  })

  it('should update evidence label and track editor', async () => {
    const ctx = createContext({
      id: 1,
      email: 'quality@example.com',
      name: 'Quality',
      role: 'QUALITY_MANAGER',
    })

    ctx.prisma.evidence.findFirst.mockResolvedValue({
      id: 8,
      label: 'Rótulo anterior',
      deletedAt: null,
    })
    ctx.prisma.evidence.update.mockResolvedValue({
      id: 8,
      fileName: 'foto.jpg',
      label: 'Novo rótulo',
      objectKey: 'nonConformity/1/foto.jpg',
      bucketName: 'evidences',
      contentType: 'image/jpeg',
      sizeBytes: 1200,
      uploadedById: 1,
      uploadedBy: { id: 1, name: 'Quality' },
      updatedById: 1,
      updatedBy: { id: 1, name: 'Quality' },
      deletedById: null,
      deletedBy: null,
      deletedAt: null,
      nonConformityId: 1,
      correctiveActionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const result = await updateEvidence({}, { id: 8, label: 'Novo rótulo' }, ctx, {} as never)

    expect(ctx.prisma.evidence.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: {
        label: 'Novo rótulo',
        updatedById: 1,
      },
      include: expect.any(Object),
    })
    expect(result?.label).toBe('Novo rótulo')
  })
})
