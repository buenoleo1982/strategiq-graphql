declare module 'pino-roll' {
  import type { DestinationStream } from 'pino'

  export interface PinoRollOptions {
    file: string
    frequency?: 'daily' | 'hourly'
    size?: string
    mkdir?: boolean
  }

  export function build(options: PinoRollOptions): DestinationStream
}
