import { inputObjectType, objectType } from 'nexus'
import { Pagination } from '../utils'
import { buildEvidenceDownloadUrl } from '@/service/evidences'

export const Evidence = objectType({
  name: 'Evidence',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('fileName')
    t.string('label')
    t.nonNull.string('contentType')
    t.nonNull.int('sizeBytes')
    t.int('uploadedById')
    t.int('strategicObjectiveId')
    t.int('initiativeId')
    t.int('indicatorId')
    t.int('nonConformityId')
    t.int('correctiveActionId')
    t.nonNull.string('downloadUrl', {
      resolve: evidence => buildEvidenceDownloadUrl(evidence.id),
    })
    t.nonNull.field('createdAt', { type: 'DateTime' })
    t.nonNull.field('updatedAt', { type: 'DateTime' })
  },
})

export const EvidenceList = objectType({
  name: 'EvidenceList',
  definition(t) {
    t.list.nonNull.field('nodes', { type: Evidence })
    t.nonNull.field('pagination', { type: Pagination })
  },
})

export const EvidenceArgs = inputObjectType({
  name: 'EvidenceArgs',
  definition(t) {
    t.int('id')
    t.int('strategicObjectiveId')
    t.int('initiativeId')
    t.int('indicatorId')
    t.int('nonConformityId')
    t.int('correctiveActionId')
  },
})
