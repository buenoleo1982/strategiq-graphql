import type { FieldResolver } from 'nexus'
import { requireAuth } from '@/lib/auth/guards'
import { IndicatorEntryCsvService } from '@/service/indicator-entry-csv'

const csvService = new IndicatorEntryCsvService()

export const importIndicatorEntriesCsv: FieldResolver<
  'Mutation',
  'importIndicatorEntriesCsv'
> = async (_, args, ctx) => {
  requireAuth(ctx)

  const parsedCsv = csvService.parse({
    csvContent: args.csvContent,
    defaultIndicatorId: args.indicatorId,
    defaultSource: args.defaultSource,
  })

  if (!parsedCsv.rows.length) {
    return {
      importedCount: 0,
      entries: [],
      errors: parsedCsv.errors,
    }
  }

  const indicatorIds = [...new Set(parsedCsv.rows.map(row => row.indicatorId))]
  const existingIndicators = await ctx.prisma.indicator.findMany({
    where: {
      id: {
        in: indicatorIds,
      },
    },
    select: {
      id: true,
    },
  })

  const validIndicatorIds = new Set(existingIndicators.map(indicator => indicator.id))
  const importableRows = parsedCsv.rows.filter((row, _index) => {
    if (validIndicatorIds.has(row.indicatorId)) {
      return true
    }

    parsedCsv.errors.push({
      row: row.rowNumber,
      message: `Indicador ${row.indicatorId} não encontrado.`,
    })

    return false
  })

  if (!importableRows.length) {
    return {
      importedCount: 0,
      entries: [],
      errors: parsedCsv.errors,
    }
  }

  const entries = await ctx.prisma.indicatorEntry.createManyAndReturn({
    data: importableRows.map(({ rowNumber: _rowNumber, ...row }) => row),
  })

  return {
    importedCount: entries.length,
    entries,
    errors: parsedCsv.errors.sort((left, right) => left.row - right.row),
  }
}
