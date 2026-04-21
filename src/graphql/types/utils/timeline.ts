import { enumType, objectType } from 'nexus'

export const TimelineEventKind = enumType({
  name: 'TimelineEventKind',
  members: ['CREATED', 'UPDATED', 'EVIDENCE_ADDED', 'EVIDENCE_REMOVED', 'EFFECTIVENESS_CHECKED'],
})

export const TimelineEvent = objectType({
  name: 'TimelineEvent',
  definition(t) {
    t.nonNull.string('id')
    t.nonNull.field('kind', { type: TimelineEventKind })
    t.nonNull.string('description')
    t.string('actorName')
    t.nonNull.field('occurredAt', { type: 'DateTime' })
  },
})
