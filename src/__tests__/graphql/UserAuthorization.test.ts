import { GraphQLError } from 'graphql'
import { describe, expect, it, vi } from 'vitest'
import { createUser } from '@/graphql/resolvers/user/mutation/createUser'
import { deleteUser } from '@/graphql/resolvers/user/mutation/deleteUser'
import { updateUser } from '@/graphql/resolvers/user/mutation/updateUser'

const createContext = (
  currentUser?: { id: number; email: string; name: string; role: 'ADMIN' | 'QUALITY_MANAGER' | 'MANAGER' | 'ANALYST' } | null
) =>
  ({
    currentUser: currentUser ?? null,
    prisma: {
      user: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  }) as any

describe('User authorization resolvers', () => {
  describe('updateUser', () => {
    it('should require authentication', async () => {
      const ctx = createContext(null)

      await expect(
        updateUser(
          {},
          {
            id: 1,
            name: 'Updated Name',
          },
          ctx,
          {} as never
        )
      ).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should reject updates for another user', async () => {
      const ctx = createContext({
        id: 2,
        email: 'another@example.com',
        name: 'Another User',
        role: 'ANALYST',
      })

      await expect(
        updateUser(
          {},
          {
            id: 1,
            name: 'Updated Name',
          },
          ctx,
          {} as never
        )
      ).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should allow updates for the owner', async () => {
      const ctx = createContext({
        id: 1,
        email: 'owner@example.com',
        name: 'Owner User',
        role: 'ANALYST',
      })

      ctx.prisma.user.update.mockResolvedValue({
        id: 1,
        name: 'Updated Name',
        email: 'owner@example.com',
      })

      const result = await updateUser(
        {},
        {
          id: 1,
          name: 'Updated Name',
        },
        ctx,
        {} as never
      )

      expect(ctx.prisma.user.update).toHaveBeenCalled()
      expect(result).toMatchObject({
        id: 1,
        name: 'Updated Name',
      })
    })
  })

  describe('createUser', () => {
    it('should require authentication', async () => {
      const ctx = createContext(null)

      await expect(
        createUser(
          {},
          {
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
          },
          ctx,
          {} as never
        )
      ).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should reject non-admin users', async () => {
      const ctx = createContext({
        id: 1,
        email: 'analyst@example.com',
        name: 'Analyst User',
        role: 'ANALYST',
      })

      await expect(
        createUser(
          {},
          {
            name: 'New User',
            email: 'new@example.com',
            password: 'password123',
          },
          ctx,
          {} as never
        )
      ).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should allow admin users', async () => {
      const ctx = createContext({
        id: 1,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      })

      ctx.prisma.user.create.mockResolvedValue({
        id: 2,
        name: 'New User',
        email: 'new@example.com',
        role: 'ANALYST',
      })

      const result = await createUser(
        {},
        {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        },
        ctx,
        {} as never
      )

      expect(ctx.prisma.user.create).toHaveBeenCalled()
      expect(result).toMatchObject({
        id: 2,
        role: 'ANALYST',
      })
    })
  })

  describe('deleteUser', () => {
    it('should require authentication', async () => {
      const ctx = createContext(null)

      await expect(deleteUser({}, { id: 1 }, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should reject deletion for another user', async () => {
      const ctx = createContext({
        id: 2,
        email: 'another@example.com',
        name: 'Another User',
        role: 'ANALYST',
      })

      await expect(deleteUser({}, { id: 1 }, ctx, {} as never)).rejects.toBeInstanceOf(GraphQLError)
    })

    it('should allow deletion for the owner', async () => {
      const ctx = createContext({
        id: 1,
        email: 'owner@example.com',
        name: 'Owner User',
        role: 'ANALYST',
      })

      ctx.prisma.user.delete.mockResolvedValue({
        id: 1,
        name: 'Owner User',
        email: 'owner@example.com',
      })

      const result = await deleteUser({}, { id: 1 }, ctx, {} as never)

      expect(ctx.prisma.user.delete).toHaveBeenCalled()
      expect(result).toMatchObject({
        id: 1,
        name: 'Owner User',
      })
    })
  })
})
