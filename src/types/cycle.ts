import { registerEnumType } from 'type-graphql'

export enum Cycle {
  MINUTE = 60000,
  HOUR = 3600000,
  DAY = 86400000,
  WEEK = Cycle.DAY * 7,
}

export enum Interval {
  WEEK = Cycle.WEEK,
  DAY = Cycle.DAY,
  HOUR = Cycle.HOUR,
}

registerEnumType(Interval, { name: 'Interval' })
