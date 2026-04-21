import { describe, expect, it } from 'vitest'
import { buildEntityTimeline } from '@/service/timeline'

describe('Timeline service', () => {
  it('should build a sorted timeline with audit, evidence and effectiveness events', () => {
    const timeline = buildEntityTimeline(
      'Ação corretiva',
      {
        id: 9,
        createdAt: new Date('2026-04-19T10:00:00.000Z'),
        updatedAt: new Date('2026-04-20T10:00:00.000Z'),
        createdBy: { name: 'Maria Qualidade' },
        updatedBy: { name: 'João Gestor' },
        evidences: [
          {
            id: 2,
            fileName: 'print.png',
            label: 'Print do processo',
            createdAt: new Date('2026-04-20T09:00:00.000Z'),
            deletedAt: new Date('2026-04-21T09:00:00.000Z'),
            uploadedBy: { name: 'Maria Qualidade' },
            deletedBy: { name: 'João Gestor' },
          },
        ],
      },
      [{ id: 5, checkedAt: new Date('2026-04-20T15:00:00.000Z') }]
    )

    expect(timeline.map(event => event.kind)).toEqual([
      'EVIDENCE_REMOVED',
      'EFFECTIVENESS_CHECKED',
      'UPDATED',
      'EVIDENCE_ADDED',
      'CREATED',
    ])
    expect(timeline[0]).toMatchObject({
      description: 'Evidência removida: Print do processo',
      actorName: 'João Gestor',
    })
    expect(timeline[3]).toMatchObject({
      description: 'Evidência anexada: Print do processo',
      actorName: 'Maria Qualidade',
    })
  })
})
