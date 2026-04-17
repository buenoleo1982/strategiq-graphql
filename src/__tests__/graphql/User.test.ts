import { describe, expect, it } from 'vitest'
import { createTestServer, executeGraphQL } from '../setup/graphql-test-helper'
import { setupTestDatabase } from '../setup/test-context'

describe('User GraphQL Type', () => {
  const { getContext } = setupTestDatabase()

  describe('Query: users', () => {
    it('should return empty array when no users exist', async () => {
      const ctx = getContext()
      const testServer = await createTestServer(ctx.prisma)

      const query = `
        query {
          userLoad {
            nodes {
              id
              name
              email
            }
            pagination {
              totalCount
              page
              pageSize
              hasMore
            }
          }
        }
      `

      const result = await executeGraphQL(testServer, query)

      expect(result.data?.userLoad.nodes).toEqual([])
      expect(result.data?.userLoad.pagination).toMatchObject({
        totalCount: 0,
        pageSize: 10,
        hasMore: false,
        page: 1
      })
    })

    it('should return all users', async () => {
      const ctx = getContext()

      // Create test users
      await ctx.prisma.user.createMany({
        data: [
          { name: 'João Silva', email: 'joao@example.com', password: 'password123' },
          { name: 'Maria Santos', email: 'maria@example.com', password: 'password123' },
        ],
      })

      const testServer = await createTestServer(ctx.prisma)

      const query = `
        query {
          userLoad {
            nodes {
              id
              name
              email
            }
            pagination {
              totalCount
              page
              pageSize
              hasMore
            }
          }
        }
      `

      const result = await executeGraphQL(testServer, query)

      expect(result.data?.userLoad.nodes).toHaveLength(2)
      expect(result.data?.userLoad.nodes[0]).toMatchObject({
        name: 'João Silva',
        email: 'joao@example.com',
      })
      expect(result.data?.userLoad.nodes[1]).toMatchObject({
        name: 'Maria Santos',
        email: 'maria@example.com',
      })
      expect(result.data?.userLoad.pagination).toMatchObject({
        totalCount: 2,
        pageSize: 10,
        hasMore: false,
        page: 1
      })
    })

    it('should include timestamps in user data', async () => {
      const ctx = getContext()

      await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(ctx.prisma)

      const query = `
        query {
          userLoad {
            nodes {
              id
              name
              email
              createdAt
              updatedAt
            }
            pagination {
              totalCount
              page
              pageSize
              hasMore
            }
          }
        }
      `

      const result = await executeGraphQL(testServer, query)

      expect(result.data?.userLoad.nodes[0]).toHaveProperty('createdAt')
      expect(result.data?.userLoad.nodes[0]).toHaveProperty('updatedAt')
      expect(new Date(result.data?.userLoad.nodes[0].createdAt)).toBeInstanceOf(Date)
    })
  })

  describe('Query: user', () => {
    it('should return null for non-existent user', async () => {
      const ctx = getContext()
      const testServer = await createTestServer(ctx.prisma)

      const query = `
        query {
          userGet(id: 999) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, query)

      expect(result.data?.userGet).toBeNull()
    })

    it('should return user by id', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(ctx.prisma)

      const query = `
        query {
          userGet(id: ${createdUser.id}) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, query)

      expect(result.data?.userGet).toMatchObject({
        id: createdUser.id,
        name: 'Test User',
        email: 'test@example.com',
      })
    })
  })

  describe('Mutation: createUser', () => {
    it('should not create user without authentication', async () => {
      const ctx = getContext()
      const testServer = await createTestServer(ctx.prisma)

      const mutation = `
        mutation {
          createUser(
            name: "New User"
            email: "new@example.com"
            password: "password123"
          ) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('autenticad')
    })

    it('should create a new user when authenticated', async () => {
      const ctx = getContext()

      // Create an authenticated user first
      const authenticatedUser = await ctx.prisma.user.create({
        data: { name: 'Admin User', email: 'admin@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            name: authenticatedUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          createUser(
            name: "New User"
            email: "new@example.com"
            password: "password123"
          ) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.data?.createUser).toMatchObject({
        name: 'New User',
        email: 'new@example.com',
      })
      expect(result.data?.createUser).toHaveProperty('id')

      // Verify user was created in database
      const userInDb = await ctx.prisma.user.findUnique({
        where: { email: 'new@example.com' },
      })
      expect(userInDb).toBeTruthy()
      expect(userInDb?.name).toBe('New User')
    })

    it('should not create user with duplicate email', async () => {
      const ctx = getContext()

      // Create initial user
      await ctx.prisma.user.create({
        data: { name: 'Existing User', email: 'existing@example.com', password: 'password123' },
      })

      // Create authenticated user
      const authenticatedUser = await ctx.prisma.user.create({
        data: { name: 'Admin User', email: 'admin@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: authenticatedUser.id,
            email: authenticatedUser.email,
            name: authenticatedUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          createUser(
            name: "Duplicate User"
            email: "existing@example.com"
            password: "password123"
          ) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('email')
    })
  })

  describe('Mutation: updateUser', () => {
    it('should not update user without authentication', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Original Name', email: 'original@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(ctx.prisma)

      const mutation = `
        mutation {
          updateUser(id: ${createdUser.id}, name: "Updated Name") {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('autenticado')
    })

    it('should not update another user record', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Original Name', email: 'original@example.com', password: 'password123' },
      })

      const anotherUser = await ctx.prisma.user.create({
        data: { name: 'Another User', email: 'another@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: anotherUser.id,
            email: anotherUser.email,
            name: anotherUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          updateUser(id: ${createdUser.id}, name: "Updated Name") {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('permissão')
    })

    it('should update own user record when authenticated', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Original Name', email: 'original@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          updateUser(id: ${createdUser.id}, name: "Updated Name") {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.data?.updateUser).toMatchObject({
        id: createdUser.id,
        name: 'Updated Name',
        email: 'original@example.com',
      })
    })

    it('should return null for non-existent user update', async () => {
      const ctx = getContext()
      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: 999,
            email: 'ghost@example.com',
            name: 'Ghost User',
          },
        }
      )

      const mutation = `
        mutation {
          updateUser(id: 999, name: "Updated Name") {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.data?.updateUser).toBeNull()
    })
  })

  describe('Mutation: deleteUser', () => {
    it('should not delete user without authentication', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(ctx.prisma)

      const mutation = `
        mutation {
          deleteUser(id: ${createdUser.id}) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('autenticado')
    })

    it('should not delete another user record', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'password123' },
      })

      const anotherUser = await ctx.prisma.user.create({
        data: { name: 'Another User', email: 'another@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: anotherUser.id,
            email: anotherUser.email,
            name: anotherUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          deleteUser(id: ${createdUser.id}) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.errors).toBeDefined()
      expect(result.errors?.[0]?.message).toContain('permissão')
    })

    it('should delete own user record when authenticated', async () => {
      const ctx = getContext()

      const createdUser = await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com', password: 'password123' },
      })

      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
          },
        }
      )

      const mutation = `
        mutation {
          deleteUser(id: ${createdUser.id}) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.data?.deleteUser).toMatchObject({
        id: createdUser.id,
        name: 'Test User',
        email: 'test@example.com',
      })

      // Verificar se o usuário foi realmente deletado
      const deletedUser = await ctx.prisma.user.findUnique({
        where: { id: createdUser.id },
      })
      expect(deletedUser).toBeNull()
    })

    it('should return null for non-existent user deletion', async () => {
      const ctx = getContext()
      const testServer = await createTestServer(
        { prisma: ctx.prisma },
        {
          currentUser: {
            id: 999,
            email: 'ghost@example.com',
            name: 'Ghost User',
          },
        }
      )

      const mutation = `
        mutation {
          deleteUser(id: 999) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(testServer, mutation)

      expect(result.data?.deleteUser).toBeNull()
    })
  })
})
