# StrategiQ Backend - GraphQL API

API GraphQL construída com Bun, GraphQL Yoga, Nexus e Prisma ORM.

## Tecnologias

- **Bun**: Runtime JavaScript rápido e all-in-one
- **GraphQL Yoga**: Servidor GraphQL moderno e flexível
- **Nexus**: Geração de schema GraphQL type-safe
- **Prisma ORM**: ORM moderno e agnóstico de banco de dados
- **SQLite**: Banco de dados leve para desenvolvimento (fácil trocar para PostgreSQL/MySQL)

## Estrutura do Projeto

```
backend/
├── prisma/
│   └── schema.prisma         # Schema do Prisma (agnóstico de DB)
├── src/
│   ├── db/
│   │   └── index.ts          # Cliente Prisma
│   ├── graphql/
│   │   ├── types/            # Tipos GraphQL (Nexus)
│   │   │   ├── User.ts
│   │   │   ├── Post.ts
│   │   │   ├── Query.ts
│   │   │   ├── Mutation.ts
│   │   │   ├── Scalars.ts
│   │   │   └── index.ts
│   │   └── schema.ts         # Configuração do schema Nexus
│   └── context.ts            # Contexto GraphQL
└── index.ts                  # Servidor principal
```

## Instalação

1. Instale as dependências:

```bash
bun install
```

2. Configure as variáveis de ambiente (opcional):

```bash
cp .env.example .env
```

OO arquivo `.env` permitejá customizarvem o caminhoconfigurado para banco SQLiteSQLite:

```env
DATABASE_PATH=."file./sqlite.dbdev.db"
PORT=4000
```

## Configuração do Banco de Dados

Para testes iniciais, o projeto usa SQLite (sem necessidade de servidor de banco de dados)O Prisma facilita trabalhar com qualquer banco de dados.Paratestes,estamos usando SQLite.

Sincronize o schema com o banco de dados:
###Desenvolvimentocom SQLite (padrão)Sincronizecom o banco de dados
```bash
bun run db:push
```

Isso criará automaticamente o arquivo `dev.db` com todas as tabelas.

### Migração para PostgreSQL ou MySQL

Basta alterar o `provider` em `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // ou "mysql"
  url      = env("DATABASE_URL")
}
```

E atualizar o `DATABASE_URL` no `.env`:

```env
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# MySQL
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

Isso criará automaticamente o arquivo `sqlite.db` na raiz do projeto com todas as tabelas.

## Scripts Disponíveis

- `bun run dev` - Inicia o servidor em modo desenvolvimento (com hot reload)
- `bun run start` - Inicia o servidor em modo produção
- `bun run db:generate` - Gera o Prisma Client
- `bun run db:migrate` - Cria e aplica migrations
- `bun run db:push` - Sincroniza o schema diretamente (desenvolvimento)
- `bun run db:studio` - Abre o Prisma Studio (interface visual do DB)

## Desenvolvimento

Inicie o servidor em modo desenvolvimento:

```bash
bun run dev
```

O servidor estará disponível em `http://localhost:4000/graphql` com GraphiQL habilitado.

## Schema GraphQL

### Queries

```graphql
# Buscar todos os usuários
query {
  users {
    id
    name
    email
    posts {
      id
      title
    }
  }
}

# Buscar um usuário específico
query {
  user(id: 1) {
    id
    name
    email
  }
}

# Buscar todos os posts
query {
  posts {
    id
    title
    content
    author {
      name
    }
  }
}
```

### Mutations

```graphql
# Criar usuário
mutation {
  createUser(name: "João Silva", email: "joao@example.com") {
    id
    name
    email
  }
}

# Criar post
mutation {
  createPost(
    title: "Meu primeiro post"
    content: "Conteúdo do post"
    authorId: 1
  ) {
    id
    title
    author {
      name
    }
  }
}
```

## Modelos do Banco de Dados

O projeto inclui dois modelos de exemplo:

### User
- id: Int (auto-increment)
- name: String
- email: String (unique)
- createdAt: DateTime
- updatedAt: DateTime
- posts: Post[] (relação)

### Post
- id: Int (auto-increment)
- title: String
- content: String (opcional)
- authorId: Int
- author: User (relação)
- published: DateTime (opcional)
- createdAt: DateTime
- updatedAt: DateTime

## Prisma Studio

Visualize e edite seus dados com o Prisma Studio:

```bash
bun run db:studio
```

Acesse em `http://localhost:5555`

## Vantagens do Prisma

- **Agnóstico de Banco**: Troque entre SQLite, PostgreSQL, MySQL sem mudar código
- **Type-Safe**: TypeScript em todo lugar, autocomplete perfeito
- **Migrations**: Sistema de migrations robusto
- **Studio**: Interface visual para gerenciar dados
- **Relações**: Queries relacionais simples e intuitivas
