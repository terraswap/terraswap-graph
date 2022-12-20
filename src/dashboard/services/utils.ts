import { Cycle } from 'types'

export function floorTimestamp(timestamp: number, cycle: Cycle): number {
  return timestamp - (timestamp % cycle)
}
