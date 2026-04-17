# StrategiQ Backend

API do StrategiQ construída com `Bun`, `Fastify`, `Apollo Server`, `Nexus`, `Prisma`, `PostgreSQL` e `Redis`.

## Stack atual

- `Bun`
- `Fastify`
- `Apollo Server`
- `GraphQL`
- `Nexus`
- `Prisma`
- `PostgreSQL`
- `Redis`
- `Pino`
- `Vitest`
- `Biome`

## Estado atual da API

Hoje o backend já possui:

- servidor GraphQL com endpoint `/graphql`
- autenticação com `register`, `login`, `refreshToken`, `logout` e `me`
- contexto autenticado com usuário atual
- CRUD básico de usuários
- integração com Redis para refresh token e blacklist
- logger estruturado e trace id
- testes de GraphQL e logger

## Requisitos

- `Bun`
- `Docker` e `Docker Compose`

## Instalação

```bash
bun install
cp .env.example .env
```

## Subindo dependências locais

```bash
docker compose up -d
```

Serviços locais disponíveis:

- PostgreSQL em `localhost:5432`
- Redis em `localhost:6379`

## Variáveis de ambiente principais

Exemplo de `DATABASE_URL` local:

```env
DATABASE_URL="postgresql://strategiq:strategiq@localhost:5432/strategiq"
JWT_SECRET="change-me"
REDIS_HOST="localhost"
REDIS_PORT="6379"
PORT=4000
```

## Banco de dados

Gerar client Prisma:

```bash
bun run db:generate
```

Aplicar migrations em desenvolvimento:

```bash
bun run db:migrate
```

Sincronizar schema sem migration:

```bash
bun run db:push
```

Abrir Prisma Studio:

```bash
bun run db:studio
```

Popular com seed:

```bash
bun run db:seed
```

## Desenvolvimento

```bash
bun run dev
```

API disponível em:

```text
http://localhost:4000/graphql
```

## Scripts principais

- `bun run dev`
- `bun run build`
- `bun run start`
- `bun run test`
- `bun run test:run`
- `bun run test:coverage`
- `bun run lint`
- `bun run format`
- `bun run typecheck`
- `bun run check`

## Schema GraphQL atual

Queries:

- `me`
- `userGet`
- `userLoad`

Mutations:

- `register`
- `login`
- `logout`
- `refreshToken`
- `createUser`
- `updateUser`
- `deleteUser`

## Estrutura principal

```text
src/
  db/
  graphql/
    resolvers/
    types/
  lib/
    auth/
    cache/
    logger/
  support/
  __tests__/
```

## Observações

- a documentação antiga que mencionava `GraphQL Yoga` e `SQLite` não representa mais a implementação real
- o repositório já está em PostgreSQL + Redis local
- a próxima etapa natural é expandir os domínios de negócio além de `auth` e `user`
