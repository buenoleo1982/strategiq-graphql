import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { PasswordService } from '@/lib/auth/password'

export const createUser: FieldResolver<'Mutation', 'createUser'> = async (_, args, ctx) => {
  // Apenas usuários autenticados podem criar novos usuários
  requireAuth(ctx)

  const { name, email, password } = args

  // Hash da senha
  const hashedPassword = await PasswordService.hash(password)

  // Cria o usuário
  return ctx.prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
}
