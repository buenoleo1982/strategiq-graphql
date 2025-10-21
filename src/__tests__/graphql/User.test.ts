import { describe, expect, it } from 'vitest'
import { createTestServer, executeGraphQL } from '../setup/graphql-test-helper'
import { setupTestDatabase } from '../setup/test-context'

describe('User GraphQL Type', () => {
  const { getContext } = setupTestDatabase()

  describe('Query: users', () => {
    it('should return empty array when no users exist', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const query = `
        query {
          users {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, query)

      expect(result.data.users).toEqual([])
    })

    it('should return all users', async () => {
      const ctx = getContext()

      // Create test users
      await ctx.prisma.user.createMany({
        data: [
          { name: 'João Silva', email: 'joao@example.com' },
          { name: 'Maria Santos', email: 'maria@example.com' },
        ],
      })

      const yoga = createTestServer(ctx.prisma)

      const query = `
        query {
          users {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, query)

      expect(result.data.users).toHaveLength(2)
      expect(result.data.users[0]).toMatchObject({
        name: 'João Silva',
        email: 'joao@example.com',
      })
      expect(result.data.users[1]).toMatchObject({
        name: 'Maria Santos',
        email: 'maria@example.com',
      })
    })

    it('should include timestamps in user data', async () => {
      const ctx = getContext()

      await ctx.prisma.user.create({
        data: { name: 'Test User', email: 'test@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const query = `
        query {
          users {
            id
            name
            email
            createdAt
            updatedAt
          }
        }
      `

      const result = await executeGraphQL(yoga, query)

      expect(result.data.users[0]).toHaveProperty('createdAt')
      expect(result.data.users[0]).toHaveProperty('updatedAt')
      expect(new Date(result.data.users[0].createdAt)).toBeInstanceOf(Date)
    })
  })

  describe('Query: user', () => {
    it('should return null when user does not exist', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const query = `
        query GetUser($id: Int) {
          user(id: $id) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, query, { id: 999 })

      expect(result.data.user).toBeNull()
    })

    it('should return user by id', async () => {
      const ctx = getContext()

      const user = await ctx.prisma.user.create({
        data: { name: 'João Silva', email: 'joao@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const query = `
        query GetUser($id: Int) {
          user(id: $id) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, query, { id: user.id })

      expect(result.data.user).toMatchObject({
        id: user.id,
        name: 'João Silva',
        email: 'joao@example.com',
      })
    })

    it('should return null when id is not provided', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const query = `
        query GetUser($id: Int) {
          user(id: $id) {
            id
            name
          }
        }
      `

      const result = await executeGraphQL(yoga, query, {})

      expect(result.data.user).toBeNull()
    })
  })

  describe('Mutation: createUser', () => {
    it('should create a new user', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        name: 'João Silva',
        email: 'joao@example.com',
      })

      expect(result.data.createUser).toMatchObject({
        name: 'João Silva',
        email: 'joao@example.com',
      })
      expect(result.data.createUser.id).toBeDefined()

      // Verify user was created in database
      const userInDb = await ctx.prisma.user.findUnique({
        where: { id: result.data.createUser.id },
      })

      expect(userInDb).toBeDefined()
      expect(userInDb?.name).toBe('João Silva')
    })

    it('should fail when creating user with duplicate email', async () => {
      const ctx = getContext()

      await ctx.prisma.user.create({
        data: { name: 'Existing User', email: 'existing@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation CreateUser($name: String!, $email: String!) {
          createUser(name: $name, email: $email) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        name: 'Another User',
        email: 'existing@example.com',
      })

      expect(result.errors).toBeDefined()
      expect(result.errors).toHaveLength(1)
      expect(result.data.createUser).toBeNull()
    })
  })

  describe('Mutation: updateUser', () => {
    it('should update user name', async () => {
      const ctx = getContext()

      const user = await ctx.prisma.user.create({
        data: { name: 'João Silva', email: 'joao@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation UpdateUser($id: Int!, $name: String) {
          updateUser(id: $id, name: $name) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        id: user.id,
        name: 'João Santos',
      })

      expect(result.data.updateUser).toMatchObject({
        id: user.id,
        name: 'João Santos',
        email: 'joao@example.com',
      })
    })

    it('should update user email', async () => {
      const ctx = getContext()

      const user = await ctx.prisma.user.create({
        data: { name: 'João Silva', email: 'joao@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation UpdateUser($id: Int!, $email: String) {
          updateUser(id: $id, email: $email) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        id: user.id,
        email: 'joao.silva@example.com',
      })

      expect(result.data.updateUser).toMatchObject({
        id: user.id,
        email: 'joao.silva@example.com',
      })
    })

    it('should fail when updating non-existent user', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation UpdateUser($id: Int!, $name: String) {
          updateUser(id: $id, name: $name) {
            id
            name
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        id: 999,
        name: 'New Name',
      })

      expect(result.errors).toBeDefined()
    })
  })

  describe('Mutation: deleteUser', () => {
    it('should delete a user', async () => {
      const ctx = getContext()

      const user = await ctx.prisma.user.create({
        data: { name: 'João Silva', email: 'joao@example.com' },
      })

      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation DeleteUser($id: Int!) {
          deleteUser(id: $id) {
            id
            name
            email
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        id: user.id,
      })

      expect(result.data.deleteUser).toMatchObject({
        id: user.id,
        name: 'João Silva',
        email: 'joao@example.com',
      })

      // Verify user was deleted from database
      const userInDb = await ctx.prisma.user.findUnique({
        where: { id: user.id },
      })

      expect(userInDb).toBeNull()
    })

    it('should fail when deleting non-existent user', async () => {
      const ctx = getContext()
      const yoga = createTestServer(ctx.prisma)

      const mutation = `
        mutation DeleteUser($id: Int!) {
          deleteUser(id: $id) {
            id
          }
        }
      `

      const result = await executeGraphQL(yoga, mutation, {
        id: 999,
      })

      expect(result.errors).toBeDefined()
    })
  })
})
