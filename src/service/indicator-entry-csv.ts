type CsvRowError = {
  row: number
  message: string
}

type IndicatorEntryCsvRow = {
  rowNumber: number
  indicatorId: number
  value: number
  collectedAt?: Date
  source?: string
  notes?: string
}

type ParseIndicatorEntryCsvOptions = {
  csvContent: string
  defaultIndicatorId?: number | null
  defaultSource?: string | null
}

type ParseIndicatorEntryCsvResult = {
  rows: IndicatorEntryCsvRow[]
  errors: CsvRowError[]
}

const splitCsvLine = (line: string, delimiter: string) => {
  const values: string[] = []
  let currentValue = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        currentValue += '"'
        index += 1
        continue
      }

      inQuotes = !inQuotes
      continue
    }

    if (character === delimiter && !inQuotes) {
      values.push(currentValue.trim())
      currentValue = ''
      continue
    }

    currentValue += character
  }

  values.push(currentValue.trim())
  return values
}

const detectDelimiter = (headerLine: string) => {
  const commaCount = (headerLine.match(/,/g) || []).length
  const semicolonCount = (headerLine.match(/;/g) || []).length

  return semicolonCount > commaCount ? ';' : ','
}

const normalizeHeader = (value: string) => value.trim().toLowerCase()

const parseOptionalText = (value: string | undefined, fallback?: string | null) => {
  if (value && value.length > 0) {
    return value
  }

  return fallback ?? undefined
}

const parseOptionalDate = (value: string | undefined) => {
  if (!value) {
    return undefined
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return parsed
}

const parseRequiredNumber = (value: string | undefined) => {
  if (!value) {
    return null
  }

  const normalized = value.replace(',', '.')
  const parsed = Number(normalized)

  return Number.isFinite(parsed) ? parsed : null
}

export class IndicatorEntryCsvService {
  parse({
    csvContent,
    defaultIndicatorId,
    defaultSource,
  }: ParseIndicatorEntryCsvOptions): ParseIndicatorEntryCsvResult {
    const trimmedContent = csvContent.trim()

    if (!trimmedContent) {
      return {
        rows: [],
        errors: [{ row: 1, message: 'O CSV está vazio.' }],
      }
    }

    const rawLines = trimmedContent
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (rawLines.length < 2) {
      return {
        rows: [],
        errors: [{ row: 1, message: 'O CSV precisa ter cabeçalho e ao menos uma linha de dados.' }],
      }
    }

    const headerLine = rawLines[0]
    if (!headerLine) {
      return {
        rows: [],
        errors: [{ row: 1, message: 'O CSV precisa ter cabeçalho válido.' }],
      }
    }

    const delimiter = detectDelimiter(headerLine)
    const headers = splitCsvLine(headerLine, delimiter).map(normalizeHeader)

    const valueIndex = headers.indexOf('value')
    const collectedAtIndex = headers.indexOf('collectedat')
    const indicatorIdIndex = headers.indexOf('indicatorid')
    const sourceIndex = headers.indexOf('source')
    const notesIndex = headers.indexOf('notes')

    if (valueIndex === -1) {
      return {
        rows: [],
        errors: [{ row: 1, message: 'Cabeçalho inválido: a coluna "value" é obrigatória.' }],
      }
    }

    if (indicatorIdIndex === -1 && !defaultIndicatorId) {
      return {
        rows: [],
        errors: [
          {
            row: 1,
            message:
              'Cabeçalho inválido: informe "indicatorId" no CSV ou no argumento da mutation.',
          },
        ],
      }
    }

    const rows: IndicatorEntryCsvRow[] = []
    const errors: CsvRowError[] = []

    rawLines.slice(1).forEach((line, index) => {
      const rowNumber = index + 2
      const cells = splitCsvLine(line, delimiter)

      const parsedValue = parseRequiredNumber(cells[valueIndex])
      if (parsedValue === null) {
        errors.push({
          row: rowNumber,
          message: 'Valor inválido para a coluna "value".',
        })
        return
      }

      const parsedIndicatorId =
        indicatorIdIndex === -1
          ? (defaultIndicatorId ?? null)
          : parseRequiredNumber(cells[indicatorIdIndex])

      if (parsedIndicatorId === null) {
        errors.push({
          row: rowNumber,
          message: 'Valor inválido para a coluna "indicatorId".',
        })
        return
      }

      const parsedCollectedAt =
        collectedAtIndex === -1 ? undefined : parseOptionalDate(cells[collectedAtIndex])

      if (parsedCollectedAt === null) {
        errors.push({
          row: rowNumber,
          message: 'Data inválida para a coluna "collectedAt".',
        })
        return
      }

      rows.push({
        rowNumber,
        indicatorId: parsedIndicatorId,
        value: parsedValue,
        collectedAt: parsedCollectedAt,
        source: parseOptionalText(cells[sourceIndex], defaultSource),
        notes: parseOptionalText(cells[notesIndex]),
      })
    })

    return { rows, errors }
  }
}
