import { GraphQLError } from 'graphql'
import type { Context } from '@/context'

/**
 * Guard que verifica se o usuário está autenticado
 * @throws GraphQLError se o usuário não estiver autenticado
 */
export function requireAuth(ctx: Context): void {
  if (!ctx.currentUser) {
    throw new GraphQLError('Você precisa estar autenticado para acessar este recurso', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
}

/**
 * Guard que verifica se o usuário é o dono do recurso
 * @param ctx Contexto da requisição
 * @param resourceUserId ID do usuário dono do recurso
 * @throws GraphQLError se o usuário não for o dono
 */
export function requireOwnership(ctx: Context, resourceUserId: number): void {
  requireAuth(ctx)

  if (ctx.currentUser?.id !== resourceUserId) {
    throw new GraphQLError('Você não tem permissão para acessar este recurso', {
      extensions: { code: 'FORBIDDEN' },
    })
  }
}

/**
 * Verifica se o usuário está autenticado (sem lançar erro)
 * @param ctx Contexto da requisição
 * @returns true se autenticado, false caso contrário
 */
export function isAuthenticated(ctx: Context): boolean {
  return ctx.currentUser !== null
}
