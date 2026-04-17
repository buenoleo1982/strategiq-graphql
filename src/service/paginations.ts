import type { NexusGenInputs } from '@/graphql/nexus-typegen';
import type { DefaultArgs } from '@prisma/client/runtime/library';

// 1. Defina um tipo para a interface mínima que a função precisa no modelo Prisma.
// Ela precisa do método 'count'. Usamos o tipo genérico do Prisma Client para isso.

// Este tipo representa qualquer 'client' de modelo do Prisma (ex: prisma.user, prisma.post)
// Ele garante que o objeto passado possui o método 'count' com a assinatura correta.
type PrismaModelClient<A extends DefaultArgs = DefaultArgs> = {
  count: (args?: any) => Promise<number>;
  // O tipo 'findMany' pode ser adicionado se a sua função de paginação precisar dele para buscar dados.
  // findMany: (args?: any) => Promise<any[]>;
}

const DEFAULT_PAGINATION = { page: 0, limit: 10 }
type LocalPageArgs = NexusGenInputs['PageArgs']
export class PaginationService {
  // Você não precisa mais do 'db' no construtor se o Prisma Client for usado diretamente na chamada
  // Se for injetar o Prisma Client (boa prática), use-o:
  // constructor(private readonly db: PrismaClient) {}

  // Vamos assumir que você prefere uma classe limpa e genérica para a lógica de paginação:

  parsePagination(pageArgs: LocalPageArgs | undefined | null) {
    if (!pageArgs) {
      return DEFAULT_PAGINATION
    }
    return {
      limit: pageArgs.take ?? 10,
      page: pageArgs.skip ?? 0
    }
  }

  /**
   * Cria o objeto padrão de paginação.
   * @param {T} entityClient - O 'client' do modelo Prisma (ex: prisma.user, prisma.post).
   * @param {PageArgs | null | undefined} pageArgs - Argumentos de paginação (page, limit).
   * @param {C} countArgs - Argumentos opcionais para o método 'count' (ex: { where: ... }).
   * @returns {Promise<{ hasMore: boolean, page: number, pageSize: number, totalCount: number}>}
   */
  async getPagination<T extends PrismaModelClient, C extends Parameters<T['count']>[0]>(
    entityClient: T,
    pageArgs: LocalPageArgs | undefined | null,
    countArgs?: C
  ) {
    const { limit, page } = this.parsePagination(pageArgs)

    const totalCount = await entityClient.count(countArgs) as number

    const finalPage = page + 1

    const hasMore = (finalPage * limit) < totalCount

    return {
      pageSize: limit,
      totalCount,
      hasMore,
      page: finalPage,
    }
  }
}

// --- Exemplo de Uso ---
/*
// Assumindo que você importa o 'prisma' do arquivo que você forneceu
import { prisma } from './prisma-client' 

// ...
const paginator = new PaginationService()

// O TypeScript agora sabe exatamente o que esperar de prisma.user e garante o tipo dos countArgs!
const userInfo = await paginator.getPagination(
  prisma.user, // T = Prisma.UserDelegate<DefaultArgs>
  { page: 2, limit: 20 },
  { 
    where: { 
      email: { 
        contains: '@' // Tipagem garantida para o filtro 'where' do modelo User
      } 
    } 
  }
)

console.log(userInfo) // { pageSize: 20, totalCount: N, hasMore: true/false, page: 3 }
*/