import { delay } from 'bluebird'
import { getLiquidityAsUST } from 'collector/indexer/transferUpdater'
import { oracle } from 'lib/terra'
import { isTokenOrderedWell, stringToDate } from 'lib/utils'
import { PairDataEntity, PairDayDataEntity, PairHourDataEntity, PairInfoEntity } from 'orm'
import { EntityManager, getManager, getRepository } from 'typeorm'
import { Cycle } from 'types'
import { getAssetId, PoolInfoDto } from './dtos'
import { START_BLOCK_HEIGHT } from './main'
import { getBlockTime, getLatestBlockHeight, getPoolInfo } from './repository/info.repository'

async function getCandidateAddresses() {
  const sub = getRepository(PairDayDataEntity)
    .createQueryBuilder('pd')
    .select('pd.pair', 'pairAddress')
    .distinct(true)
    .getQuery()

  const mq = getRepository(PairInfoEntity)
    .createQueryBuilder('p')
    .select('p.pair', 'pair')
    .where('p.pair NOT IN (' + sub + ')')

  const pairAddresses = await mq.getRawMany()
  return pairAddresses.map((p) => p.pair)
}

async function findFirstAppearance(pair: string, latestHeight: number) {
  let l = START_BLOCK_HEIGHT + 1
  let r = latestHeight

  let res: PoolInfoDto = await getPoolInfo(pair, latestHeight)

  while (l < r) {
    const m = Math.floor((l + r) / 2)
    res = await getPoolInfo(pair, m)
    await delay(50)

    if (res) {
      r = m
    } else {
      l = m + 1
    }
  }
  if (!res) {
    res = await getPoolInfo(pair, l)
  }
  if (!res) {
    return
  }
  let retry = 3
  while (!res?.datetimeString && retry) {
    res.datetimeString = await getBlockTime(l)
    retry--
  }
  if (!retry) {
    throw new Error(`cannot get blockTime for pair ${pair}, height: ${l} `)
  }
  res.height = l
  return res
}

export async function migratePairsInfo() {
  const pairs = await getCandidateAddresses()
  const latestHeight = await getLatestBlockHeight()

  for (let i = 0; i < pairs.length; ++i) {
    const p = pairs[i]
    let poolInfo: PoolInfoDto;

    try {
      poolInfo = await findFirstAppearance(p, latestHeight)
      if (!poolInfo) continue
    } catch (err) {
      i--
      continue
    }
    const assets = poolInfo.query_result.assets.map((a) => getAssetId(a.info))

    const token0 = isTokenOrderedWell(assets)
      ? poolInfo.query_result.assets[0]
      : poolInfo.query_result.assets[1]

    const token1 = isTokenOrderedWell(assets)
      ? poolInfo.query_result.assets[1]
      : poolInfo.query_result.assets[0]

    const exchangeRate = await oracle.getExchangeRate(poolInfo.height)
    const liquidity = await getLiquidityAsUST(
      getManager(),
      {
        token0: getAssetId(token0.info),
        token0Reserve: token0.amount,
        token1: getAssetId(token1.info),
        token1Reserve: token1.amount,
      },
      poolInfo.datetimeString,
      exchangeRate
    )
    const entity = new PairDataEntity({
      pair: p,
      token0: getAssetId(token0.info),
      token1: getAssetId(token1.info),
      token0Reserve: token0.amount,
      token1Reserve: token1.amount,
      totalLpTokenShare: poolInfo.query_result.total_share,
      token0Volume: '0',
      token1Volume: '0',
      volumeUst: '0',
      liquidityUst: liquidity,
      txns: 1,
      timestamp: new Date(poolInfo.datetimeString),
    })

    const cycles = [Cycle.HOUR, Cycle.DAY]
    await getManager().transaction(async (manager) => {
      const promises = cycles.map((c) => {
        return savePairData(manager, [entity], c)
      })
      await Promise.all(promises)
    })
  }
}

async function savePairData(manager: EntityManager, entities: PairDataEntity[], cycle: Cycle) {
  if (cycle !== Cycle.HOUR && cycle !== Cycle.DAY) {
    throw new Error(`wrong format cycle`)
  }

  const parsedTimeEntities = entities.map((e) => {
    e.timestamp = stringToDate(e.timestamp.toString(), cycle)
    return e
  })

  let repo = manager.getRepository(PairHourDataEntity)

  if (cycle === Cycle.DAY) {
    repo = getRepository(PairDayDataEntity)
  }

  await repo.save(parsedTimeEntities)
}
