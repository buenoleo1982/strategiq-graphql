import { deleteEvidence } from './mutation'
import { evidenceLoad } from './query'

export const EvidenceQueryResolvers = {
  evidenceLoad,
}

export const EvidenceMutationResolvers = {
  deleteEvidence,
}

export * from './query'
export * from './mutation'
