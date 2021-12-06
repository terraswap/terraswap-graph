import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import {
  TerraswapDataDto,
  TerraswapRecentVolumeAndLiquidityDto,
} from 'dashboard/services/dtos/terraswap.dtos'
import { PairHourDataEntity, TerraswapDayDataEntity } from 'orm'
import { getManager } from 'typeorm'

@Injectable()
export class DashboardTerraswapRepository {
  async getTerraswapData(from: Date, to: Date): Promise<TerraswapDataDto[]> {
    try {
      const data = await getManager()
        .getRepository(TerraswapDayDataEntity)
        .createQueryBuilder('t')
        .select('t.timestamp', 'timestamp')
        .addSelect('t.volumeUst', 'volumeUst')
        .addSelect('t.totalLiquidityUst', 'liquidityUst')
        .where('t.timestamp >= :from', { from })
        .andWhere('t.timestamp <= :to', { to })
        .orderBy('t.timestamp', 'DESC')
        .getRawMany()
      return data
    } catch (err: any) {
      Logger.warn(`getTerraswapData err:${err.stack ? err.stack : err}`)
      throw new InternalServerErrorException(`internal server error`)
    }
  }

  async getVolumeAndLiquidity(from: Date, to: Date): Promise<TerraswapRecentVolumeAndLiquidityDto> {
    const pairRepo = getManager().getRepository(PairHourDataEntity)
    try {
      return await pairRepo
        .createQueryBuilder('p')
        .select('SUM(p.volumeUst)', 'volume')
        .addSelect('SUM(p.liquidityUst)', 'liquidity')
        .where('p.timestamp <=:to', { to })
        .andWhere('p.timestamp >=:from', { from })
        .cache(60 * 1000)
        .getRawOne()
    } catch (err: any) {
      Logger.warn(`getTerraswapRecentData err:${err.stack ? err.stack : err}`)
      throw new InternalServerErrorException(`internal server error`)
    }
  }
}
