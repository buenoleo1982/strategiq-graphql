import { enumType, objectType } from 'nexus'

export const OperationalAlertSeverityEnum = enumType({
  name: 'OperationalAlertSeverity',
  members: ['CRITICAL', 'HIGH', 'MEDIUM'],
})

export const OperationalAlert = objectType({
  name: 'OperationalAlert',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.field('severity', { type: OperationalAlertSeverityEnum })
    t.nonNull.string('title')
    t.nonNull.string('description')
    t.nonNull.string('href')
    t.nonNull.field('occurredAt', { type: 'DateTime' })
  },
})
