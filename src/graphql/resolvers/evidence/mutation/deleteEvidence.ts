import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { MinioStorageService } from '@/lib/storage/minio'

export const deleteEvidence: FieldResolver<'Mutation', 'deleteEvidence'> = async (_, args, ctx) => {
  requireAuth(ctx)

  const evidence = await ctx.prisma.evidence.findUnique({
    where: { id: args.id },
  })

  if (!evidence) {
    return null
  }

  await MinioStorageService.removeObject(evidence.objectKey)

  return ctx.prisma.evidence.delete({
    where: { id: args.id },
  })
}
