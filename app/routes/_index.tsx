import { useNavigate } from '@remix-run/react'
import type { MetaFunction } from '@vercel/remix'
import { useState } from 'react'
import { parseEventsFromLogs } from '~/parser'

export const meta: MetaFunction = () => {
  return [{ title: 'Tempo' }, { name: 'description', content: 'Write me' }]
}

export default function Index() {
  const navigate = useNavigate()

  const [logs, setLogs] = useState(defaultLogs)
  const [isParsing, setIsParsing] = useState(false)

  const parseLogs = () => {
    setIsParsing(true)

    const lines = logs.trim().split('\n')

    parseEventsFromLogs(lines)
      .then((result) => {
        console.log(result)
        const serializedEvents = btoa(JSON.stringify(result.events))

        navigate(`/events/${serializedEvents}`)
      })
      .finally(() => {
        setIsParsing(false)
      })
  }

  return (
    <div className="w-full">
      <h1>Tempo</h1>
      <p>Write me</p>

      <div className="w-full">
        <textarea
          className="w-full max-w-sm"
          disabled={isParsing}
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
        />
        <button
          disabled={isParsing}
          onClick={parseLogs}
        >
          Parse logs
        </button>
      </div>
    </div>
  )
}

const defaultLogs = `tempo;2024-07-04T13:00:00.000Z;load-data;start
tempo;2024-07-04T13:00:00.000Z;load-user;start
tempo;2024-07-04T13:00:00.000Z;load-team;start
tempo;2024-07-04T13:00:02.000Z;load-project;start
tempo;2024-07-04T13:00:02.000Z;load-user;end
tempo;2024-07-04T13:00:04.000Z;load-team;end
tempo;2024-07-04T13:00:03.000Z;load-project;end
tempo;2024-07-04T13:00:04.000Z;load-data;end
tempo;2024-07-04T13:00:04.000Z;render;start
tempo;2024-07-04T13:00:06.000Z;render;end`
