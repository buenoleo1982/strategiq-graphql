import { deleteEvidence, updateEvidence } from './mutation'
import { evidenceLoad } from './query'

export const EvidenceQueryResolvers = {
  evidenceLoad,
}

export const EvidenceMutationResolvers = {
  updateEvidence,
  deleteEvidence,
}

export * from './query'
export * from './mutation'
