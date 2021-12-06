import { Injectable, NotFoundException } from '@nestjs/common'
import { DashboardTerraswapRepository } from 'dashboard/repositories/terraswap.repository'
import memoize from 'memoizee-decorator'
import { Cycle } from 'types'
import { calculateFee, calculateIncreasedRate } from './common/utils'
import {
  TerraswapDataDto,
  TerraswapRecentCycleDto,
  TerraswapRecentDataDto,
  TerraswapRecentVolumeAndLiquidityDto,
} from './dtos/terraswap.dtos'

@Injectable()
export class DashboardTerraswapService {
  constructor(private readonly repo: DashboardTerraswapRepository) {}

  @memoize({ promise: true, maxAge: 60000, primitive: true, length: 2 })
  async getTerraswapData(from: Date, to: Date): Promise<TerraswapDataDto[]> {
    return await this.repo.getTerraswapData(from, to)
  }

  @memoize({ promise: true, maxAge: 60 * 1000 })
  async getTerraswapRecentData(): Promise<TerraswapRecentDataDto> {
    const now = Date.now()
    const today = await this.repo.getVolumeAndLiquidity(new Date(now - Cycle.DAY), new Date(now))
    const yesterday = await this.repo.getVolumeAndLiquidity(
      new Date(now - Cycle.DAY * 2),
      new Date(now - Cycle.DAY)
    )
    const thisWeek = await this.repo.getVolumeAndLiquidity(
      new Date(now - Cycle.WEEK),
      new Date(now)
    )
    const lastWeek = await this.repo.getVolumeAndLiquidity(
      new Date(now - Cycle.WEEK * 2),
      new Date(now - Cycle.WEEK)
    )

    if (!today) {
      throw new NotFoundException()
    }

    return {
      daily: this.toRecentCycleDto(today, yesterday),
      weekly: this.toRecentCycleDto(thisWeek, lastWeek),
    }
  }

  private toRecentCycleDto(
    current: TerraswapRecentVolumeAndLiquidityDto,
    previous: TerraswapRecentVolumeAndLiquidityDto
  ): TerraswapRecentCycleDto {
    const fee = calculateFee(current.volume)
    return {
      volume: current.volume,
      volumeIncreasedRate: calculateIncreasedRate(current.volume, previous.volume),
      liquidity: current.liquidity,
      liquidityIncreasedRate: calculateIncreasedRate(current.liquidity, previous.liquidity),
      fee,
      feeIncreasedRate: calculateIncreasedRate(fee, calculateFee(previous.volume)),
    }
  }
}
