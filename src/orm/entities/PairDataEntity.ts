import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm'

export class PairDataEntity {
  constructor(options: Partial<PairDataEntity>) {
    Object.assign(this, options)
  }

  @PrimaryGeneratedColumn()
  id: string

  @Index()
  @Column()
  timestamp: Date

  @Column()
  @Index()
  pair: string

  @Column()
  token0: string

  @Column('decimal', { precision: 40 })
  token0Volume: string

  @Column('decimal', { precision: 40 })
  token0Reserve: string

  @Column()
  token1: string

  @Column('decimal', { precision: 40 })
  token1Volume: string

  @Column('decimal', { precision: 40 })
  token1Reserve: string

  @Column('decimal', { precision: 40 })
  totalLpTokenShare: string

  @Column('decimal', { precision: 40 })
  volumeUst: string

  @Column('decimal', { precision: 40 })
  liquidityUst: string

  @Column()
  txns: number
}

@Index('timestamp_pair_idx_day', ['timestamp', 'pair'], { unique: true })
@Entity('pair_day_data')
export class PairDayDataEntity extends PairDataEntity {}
@Index('timestamp_pair_idx_hour', ['timestamp', 'pair'], { unique: true })
@Entity('pair_hour_data')
export class PairHourDataEntity extends PairDataEntity {}
