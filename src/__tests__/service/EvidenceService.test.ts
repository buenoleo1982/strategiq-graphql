import { describe, expect, it, vi } from 'vitest'
import {
  buildEvidenceTargetData,
  buildEvidenceWhere,
  isEvidenceEntityType,
} from '@/service/evidences'
import { MinioStorageService } from '@/lib/storage/minio'

describe('MinioStorageService', () => {
  it('should tolerate unavailable storage during warmup', async () => {
    const ensureSpy = vi
      .spyOn(MinioStorageService, 'ensureEvidenceBucket')
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))

    await expect(MinioStorageService.warmupEvidenceBucket()).resolves.toBe(false)

    ensureSpy.mockRestore()
  })
})

describe('Evidence service helpers', () => {
  it('should validate evidence entity types', () => {
    expect(isEvidenceEntityType('nonConformity')).toBe(true)
    expect(isEvidenceEntityType('unknown')).toBe(false)
  })

  it('should build target data for corrective action', () => {
    expect(buildEvidenceTargetData('correctiveAction', 9)).toEqual({
      correctiveActionId: 9,
    })
  })

  it('should build prisma where clause from filters', () => {
    expect(buildEvidenceWhere({ nonConformityId: 4 })).toEqual({
      deletedAt: null,
      nonConformityId: 4,
    })
  })

  it('should include deleted evidences when requested', () => {
    expect(buildEvidenceWhere({ nonConformityId: 4, includeDeleted: true })).toEqual({
      nonConformityId: 4,
    })
  })
})
