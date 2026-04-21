type AuditedNode = {
  createdById?: number | null
  updatedById?: number | null
  createdBy?: {
    id: number
    name: string
  } | null
  updatedBy?: {
    id: number
    name: string
  } | null
}

export const defineAuditFields = (t: any) => {
  t.int('createdById', {
    resolve: (root: unknown) =>
      (root as AuditedNode).createdBy?.id ?? (root as AuditedNode).createdById ?? null,
  })
  t.string('createdByName', {
    resolve: (root: unknown) => (root as AuditedNode).createdBy?.name ?? null,
  })
  t.int('updatedById', {
    resolve: (root: unknown) =>
      (root as AuditedNode).updatedBy?.id ?? (root as AuditedNode).updatedById ?? null,
  })
  t.string('updatedByName', {
    resolve: (root: unknown) => (root as AuditedNode).updatedBy?.name ?? null,
  })
}
