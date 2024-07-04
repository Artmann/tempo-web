import { parseEventsFromLogs } from '.'

describe('Parser', () => {
  describe('parseEventsFromLogs', () => {
    it('should parse events from logs.', async () => {
      const logs = `
tempo;2024-07-04T13:00:00.000Z;load-data;start

tempo;2024-07-04T13:00:00.000Z;load-user;start
tempo;2024-07-04T13:00:00.000Z;load-team;start
tempo;2024-07-04T13:00:02.000Z;load-project;start

tempo;2024-07-04T13:00:02.000Z;load-user;end
tempo;2024-07-04T13:00:04.000Z;load-team;end
tempo;2024-07-04T13:00:03.000Z;load-project;end

tempo;2024-07-04T13:00:04.000Z;load-data;end

tempo;2024-07-04T13:00:04.000Z;render;start
tempo;2024-07-04T13:00:06.000Z;render;end

`

      const lines = logs.trim().split('\n')

      const result = await parseEventsFromLogs(lines)

      expect(result.errors).toEqual([])

      expect(result.events).toEqual([
        {
          endedAt: '2024-07-04T13:00:04.000Z',
          name: 'load-data',
          startedAt: '2024-07-04T13:00:00.000Z'
        },
        {
          endedAt: '2024-07-04T13:00:02.000Z',
          name: 'load-user',
          startedAt: '2024-07-04T13:00:00.000Z'
        },
        {
          endedAt: '2024-07-04T13:00:04.000Z',
          name: 'load-team',
          startedAt: '2024-07-04T13:00:00.000Z'
        },
        {
          endedAt: '2024-07-04T13:00:03.000Z',
          name: 'load-project',
          startedAt: '2024-07-04T13:00:02.000Z'
        },
        {
          endedAt: '2024-07-04T13:00:06.000Z',
          name: 'render',
          startedAt: '2024-07-04T13:00:04.000Z'
        },
      ])
    })
  })
})