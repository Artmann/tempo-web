type NormalEvent = {
  endedAt?: string
  name: string
  startedAt: string
}

export type Event = NormalEvent

export type ParseError = {
  line: string
  lineNumber: number
  message: string
}

export type ParseResult = {
  errors: ParseError[]
  events: Event[]
}

export async function parseEventsFromLogs(lines: string[]): Promise<ParseResult> {
  const errors: ParseError[] = []
  const batchSize = 25

  let events: Event[] = []

  for (let i = 0; i < lines.length; i += batchSize) {
    const batch = lines.slice(i, i + batchSize)

    for (const line of batch) {
      try {
        events = parseLine(events, line)


      } catch (error: any) {
        errors.push({
          line,
          lineNumber: i,
          message: error.message
        })
      }

      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  }

  return {
    errors,
    events
  }
}

function parseLine(events: Event[], line: string): Event[] {
  const parts = line.split(';')

  if (parts.length === 0) {
    return events
  }

  if (parts[0].toLowerCase().trim() !== 'tempo') {
    return events
  }

  const [, timestamp, name, action] = parts

  if (!timestamp || !name || !action) {
    return events
  }

  if (action === 'start') {
    const newEvent = {
      name,
      startedAt: timestamp,
    }

    events.push(newEvent)
  }

  if (action === 'end') {
    const existingEvent = events.find((event) => ('name' in event && event.name === name))

    if (!existingEvent) {
      throw new Error(`No matching start event found for '${name}'.`)
    }

    if ('endedAt' in existingEvent) {
      throw new Error(`Event '${name}' already ended.`)
    }

    existingEvent.endedAt = timestamp
  }

  return events
}