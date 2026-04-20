import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { deleteEvidence } from '@/graphql/resolvers/evidence/mutation/deleteEvidence'
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
        findUnique: vi.fn(),
        findMany: vi.fn(),
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

    ctx.prisma.evidence.findUnique.mockResolvedValue({
      id: 3,
      fileName: 'checklist.txt',
      objectKey: 'correctiveAction/2/checklist.txt',
    })
    ctx.prisma.evidence.delete.mockResolvedValue({
      id: 3,
      fileName: 'checklist.txt',
      label: 'Checklist',
      objectKey: 'correctiveAction/2/checklist.txt',
      bucketName: 'evidences',
      contentType: 'text/plain',
      sizeBytes: 80,
      uploadedById: 1,
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
})
