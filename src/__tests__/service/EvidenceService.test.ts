import { describe, expect, it } from 'vitest'
import {
  buildEvidenceTargetData,
  buildEvidenceWhere,
  isEvidenceEntityType,
} from '@/service/evidences'

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
      nonConformityId: 4,
    })
  })
})
