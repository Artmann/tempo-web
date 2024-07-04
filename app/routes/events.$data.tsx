import { useLoaderData } from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/server-runtime'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import invariant from 'tiny-invariant'
import type { Event } from '~/parser'

interface LoaderData {
  events: Event
}

export const loader: LoaderFunction = async ({
  params
}): Promise<LoaderData> => {
  invariant(params.data, 'No data provided')

  const events = JSON.parse(atob(params.data))

  return { events }
}

export default function EventsRoute() {
  const { events } = useLoaderData<LoaderData>()

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  })

  const eventsWitNormalizedTime = useMemo(() => normalizeTime(events), [events])

  console.log(eventsWitNormalizedTime)

  return (
    <div className="box-border p-8 w-full">
      <div
        className="w-full"
        ref={containerRef}
      >
        <div className="space-y-2 w-full">
          {eventsWitNormalizedTime.map((event, i) => (
            <div
              key={i}
              className="relative w-full h-12"
            >
              <div
                className="absolute space-y-1"
                style={{
                  left: `${event.startedAtTimestampNormalized * 100}%`
                }}
              >
                <div className="text-xs font-medium">
                  {event.name} ({event.duration}ms)
                </div>
                <motion.div
                  className="h-6 min-w-[88px] rounded-md shadow-md"
                  style={{
                    backgroundColor: barColors[i % barColors.length]
                  }}
                  initial={{
                    width: 0
                  }}
                  animate={{
                    width: calculateBlockWidthInPixels(event, containerWidth)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const barColors = [
  '#d14d41',
  '#da702c',
  '#d0a215',
  '#679a39',
  '#3aa99f',
  '#4385be',
  '#8b7ec8',
  '#ce5d97'
]

function calculateBlockWidthInPixels(
  event: NormalizedEvent,
  containerWidth: number
) {
  if (!event.endedAtTimestampNormalized) {
    return 0
  }

  const value = Math.min(
    Math.max(
      event.endedAtTimestampNormalized - event.startedAtTimestampNormalized,
      0
    ),
    1
  )

  return value * containerWidth
}

type NormalizedEvent = Event & {
  startedAtTimestamp: number
  endedAtTimestamp?: number
  startedAtTimestampNormalized: number
  endedAtTimestampNormalized?: number
  duration: number
}

function normalizeTime(events: Event[]): NormalizedEvent[] {
  // Sort events by their start time. `startedAt` is a string in ISO 8601 format.
  const sortedEvents = events.sort((a, b) => {
    return a.startedAt.localeCompare(b.startedAt)
  })

  const eventsWithTimestamps = sortedEvents.map((event) => {
    const startedAtTimestamp = new Date(event.startedAt).getTime()
    const endedAtTimestamp = event.endedAt
      ? new Date(event.endedAt).getTime()
      : undefined

    const duration = endedAtTimestamp
      ? endedAtTimestamp - startedAtTimestamp
      : 0

    return {
      ...event,
      startedAtTimestamp,
      endedAtTimestamp,
      duration
    }
  })

  const timestamps = [
    ...new Set(
      eventsWithTimestamps
        .flatMap((event) => {
          if (event.endedAtTimestamp) {
            return [event.startedAtTimestamp, event.endedAtTimestamp]
          }

          return [event.startedAtTimestamp]
        })
        .filter((timestamp) => Boolean(timestamp))
    )
  ]

  const minTimestamp = Math.min(...timestamps)
  const maxTimestamp = Math.max(...timestamps)

  const normalizeTimestamp = (timestamp: number) => {
    return (timestamp - minTimestamp) / (maxTimestamp - minTimestamp)
  }

  const normalizedEvents = eventsWithTimestamps.map(
    (event): NormalizedEvent => {
      const startedAtTimestampNormalized = normalizeTimestamp(
        event.startedAtTimestamp
      )
      const endedAtTimestampNormalized = event.endedAtTimestamp
        ? normalizeTimestamp(event.endedAtTimestamp)
        : undefined

      return {
        ...event,
        startedAtTimestampNormalized,
        endedAtTimestampNormalized
      }
    }
  )

  return normalizedEvents
}
