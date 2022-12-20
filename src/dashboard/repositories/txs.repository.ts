import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { TerraswapAction } from 'dashboard/services/dtos/dtos'
import { TxHistoryEntity } from 'orm'
import { getManager, getRepository } from 'typeorm'
import { TXS_PAGINATED_COUNT } from './defined'

@Injectable()
export class DashboardTxsRepository {
  async getTxsOfPair(pair?: string, action?: TerraswapAction): Promise<any> {
    const repo = getManager().getRepository(TxHistoryEntity)

    try {
      const ret: any = {}
      const qb = repo.createQueryBuilder('t')

      let query = qb
        .select('t.pair', 'pairAddress')
        .addSelect('t.timestamp', 'timestamp')
        .addSelect('t.tx_hash', 'txHash')
        .addSelect('t.action', 'action')
        .addSelect('t.token0Amount', 'token0Amount')
        .addSelect('t.token1Amount', 'token1Amount')
        .addSelect('t.id', 'id')
        
      if (pair) {
        query = query.andWhere('t.pair=:pair', { pair })
      }
      if (action) {
        query = query.andWhere('t.action =:action', { action })
      }

      ret.txs = await query.orderBy('t.id', 'DESC').limit(TXS_PAGINATED_COUNT).execute()

      ret.totalCount = ret.txs?.length || 0 

      return ret
    } catch (err: any) {
      Logger.warn(`getTerraswapRecentData err:${err.stack ? err.stack : err}`)
      throw new InternalServerErrorException(`internal server error`)
    }
  }

  async getTx(hash: string): Promise<any> {
    try {
      const dto = await getRepository(TxHistoryEntity)
        .createQueryBuilder('t')
        .select('t.id', 'id')
        .addSelect('t.pair', 'pairAddress')
        .addSelect('t.timestamp', 'timestamp')
        .addSelect('t.tx_hash', 'txHash')
        .addSelect('t.action', 'action')
        .addSelect('t.token0Amount', 'token0Amount')
        .addSelect('t.token1Amount', 'token1Amount')
        .where('t.tx_hash=:hash', { hash })
        .getRawOne()
      if (!dto) {
        throw new NotFoundException(`cannot find tx:${hash}`)
      }
      return dto
    } catch (err) {
      if (err instanceof HttpException) {
        throw err
      }
      Logger.error(err)
      throw new InternalServerErrorException()
    }
  }
}
