import { createEvidence, deleteEvidence, restoreEvidence, updateEvidence } from './mutation'
import { evidenceLoad } from './query'

export const EvidenceQueryResolvers = {
  evidenceLoad,
}

export const EvidenceMutationResolvers = {
  createEvidence,
  updateEvidence,
  deleteEvidence,
  restoreEvidence,
}

export * from './query'
export * from './mutation'
