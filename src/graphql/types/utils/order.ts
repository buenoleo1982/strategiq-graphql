import { enumType } from 'nexus'

export const OrderDirection = enumType({
  name: 'OrderDirection',
  members: ['ASC', 'DESC'],
})
