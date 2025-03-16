import { BlockEntity, PairDayDataEntity, PairHourDataEntity, PairInfoEntity, TokenInfoEntity } from 'orm'
import { lcd } from "lib/terra/lcd"
import { getManager, EntityManager, getRepository } from 'typeorm'
import { ColumbusTerraswap } from 'lib/terraswap/classic'
import { isTokenOrderedWell, numberToDate, stringToDate } from 'lib/utils'
import * as logger from 'lib/logger'

import { PhoenixTerraswap } from 'lib/terraswap/terra2'

import { ClassicOddTokenAppliedPair } from 'lib/terraswap/classic.consts'
import { get } from 'lodash'
import {oracle} from 'lib/terra/oracle'
import { getLiquidityAsUST } from 'collector/indexer/transferUpdater'
import { Cycle } from 'types/cycle'

const chainId = process.env.TERRA_CHAIN_ID || 'columbus-5'

export async function updatePairData(): Promise<void> {
  logger.info('Starting pair data validation and update')
  
  // Get latest block height
  const height = (await getRepository(BlockEntity).findOne({ order: { id: 'DESC' } })).height + 1 
  logger.info(`Using block height: ${height}`)

  // @ts-ignore
  let blockTime: Date = await lcd.getBlockTime(height)
  const currentBlockHour =  stringToDate(blockTime.toISOString(), Cycle.HOUR)
  const currentBlockDay = stringToDate(blockTime.toISOString(), Cycle.DAY)

  let exchangeRate = await oracle.getExchangeRate(height- (height % 100))

  await getManager().transaction(async (manager: EntityManager) => {
    // Get all pairs from PairInfoEntity
    const allPairs = await manager.getRepository(PairInfoEntity).find()
    logger.info(`Found ${allPairs.length} pairs in the database`)
    
    // Get most recent hour data records for each pair
    const hourDataRecords = await manager.getRepository(PairHourDataEntity).createQueryBuilder()
      .distinctOn(['pair'])
      .orderBy('pair')
      .addOrderBy('timestamp', 'DESC')
      .getMany()
    
    // Get most recent day data records for each pair
    const dayDataRecords = await manager.getRepository(PairDayDataEntity).createQueryBuilder()
      .distinctOn(['pair'])
      .orderBy('pair')
      .addOrderBy('timestamp', 'DESC')
      .getMany()
    
    // Create sets of pairs that have hour/day data
    const pairsWithHourData = new Set(hourDataRecords.map(record => record.pair))
    const pairsWithDayData = new Set(dayDataRecords.map(record => record.pair))
    
    let updatedHourRecords = 0
    let updatedDayRecords = 0
    let createdHourRecords = 0
    let createdDayRecords = 0
    

    
    // Process each pair from PairInfoEntity
    for (const pair of allPairs) {
      // Skip pairs in exception list
      if (validationExceptionSet.has(pair.pair)) {
        continue
      }
      
      // Get pool info for this pair
      let poolInfo
      let retry = 3
      while (retry > 0 && !poolInfo) {
        try {
          poolInfo = await lcd.getPoolInfo(pair.pair, height)
        } catch (err) {
          logger.warn(`Skip: pair ${pair.pair} pool info error ${err.message}`)
          retry--
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      if (retry === 0) {
        logger.error(`Failed to get pool info for pair ${pair.pair}`)
        continue
    }
      
      // Determine which asset corresponds to which token
      let token0Amount = poolInfo.assets[0].amount
      let token1Amount = poolInfo.assets[1].amount
      if ((poolInfo.assets[1].info.native_token?.denom === pair.token0) || 
          (poolInfo.assets[1].info.token?.contract_addr === pair.token0)) {
        token0Amount = poolInfo.assets[1].amount
        token1Amount = poolInfo.assets[0].amount
      }
      
      const lpAmount = poolInfo.total_share
      
      // Check if pair has hour data and update or create as needed
      if (pairsWithHourData.has(pair.pair)) {
        // Find and update existing hour data
        const hourRecord = hourDataRecords.find(record => record.pair === pair.pair)
        if (hourRecord) {
          try {
            const updated = await updatePairDataRecord(hourRecord, height, manager, 
              token0Amount, token1Amount, lpAmount)
            if (updated) updatedHourRecords++
          } catch (err) {
            logger.error(`Failed to update hour data for pair ${pair.pair}: ${err.message}`)
          }
        }
      } else {
        // Create new hour data record
        try {
          const newHourData = new PairHourDataEntity({})
          newHourData.pair = pair.pair
          newHourData.txns = 0
          newHourData.token0 = pair.token0
          newHourData.token1 = pair.token1
          newHourData.token0Reserve = token0Amount
          newHourData.token1Reserve = token1Amount
          newHourData.token0Volume = "0"
          newHourData.token1Volume = "0"
          newHourData.totalLpTokenShare = lpAmount
          newHourData.timestamp = currentBlockHour
          newHourData.volumeUst = "0"
          newHourData.liquidityUst = await getLiquidityAsUST(manager, {
            token0: pair.token0,
            token1: pair.token1,
            token0Reserve: token0Amount,
            token1Reserve: token1Amount
          }, "2025-02-10 09:00:00", exchangeRate)
          
          await manager.getRepository(PairHourDataEntity).save(newHourData)
          createdHourRecords++
          logger.info(`Created new hour data record for pair ${pair.pair}`)
        } catch (err) {
          logger.error(`Failed to create hour data for pair ${pair.pair}: ${err.message}`)
        }
      }
      
      // Check if pair has day data and update or create as needed
      if (pairsWithDayData.has(pair.pair)) {
        // Find and update existing day data
        const dayRecord = dayDataRecords.find(record => record.pair === pair.pair)
        if (dayRecord) {
          try {
            const updated = await updatePairDataRecord(dayRecord, height, manager,
              token0Amount, token1Amount, lpAmount)
            if (updated) updatedDayRecords++
          } catch (err) {
            logger.error(`Failed to update day data for pair ${pair.pair}: ${err.message}`)
          }
        }
      } else {
        // Create new day data record
        try {
          const newDayData = new PairDayDataEntity({})
          newDayData.pair = pair.pair
          newDayData.txns = 0
          newDayData.token0 = pair.token0
          newDayData.token1 = pair.token1
          newDayData.token0Reserve = token0Amount
          newDayData.token1Reserve = token1Amount
          newDayData.token0Volume = "0"
          newDayData.token1Volume = "0"
          newDayData.totalLpTokenShare = lpAmount
          newDayData.timestamp = currentBlockDay
          newDayData.volumeUst = "0"
          newDayData.liquidityUst = await getLiquidityAsUST(manager, {
            token0: pair.token0,
            token1: pair.token1,
            token0Reserve: token0Amount,
            token1Reserve: token1Amount
          }, "2025-02-10 00:00:00", exchangeRate)
          
          await manager.getRepository(PairDayDataEntity).save(newDayData)
          createdDayRecords++
          logger.info(`Created new day data record for pair ${pair.pair}`)
        } catch (err) {
          logger.error(`Failed to create day data for pair ${pair.pair}: ${err.message}`)
        }
      }
    }
    
    logger.info(`Updated ${updatedHourRecords} hour data records and ${updatedDayRecords} day data records`)
    logger.info(`Created ${createdHourRecords} new hour data records and ${createdDayRecords} new day data records`)
  })
  
  logger.info('Pair data validation and update completed')
}

/**
 * Updates a pair data record (hour or day) with current on-chain data
 * @returns boolean indicating if the record was updated
 */
async function updatePairDataRecord(
  record: any, 
  height: number, 
  manager: EntityManager,
  token0Amount?: string,
  token1Amount?: string,
  lpAmount?: string
): Promise<boolean> {
  // If token amounts are provided, use them directly
  if (!token0Amount || !token1Amount || !lpAmount) {
    // Get pool info from blockchain if not provided
    let poolInfo;
    try {
      poolInfo = await lcd.getPoolInfo(record.pair, height)
    } catch (err) {
      logger.warn(`Skip: pair ${record.pair} pool info error ${err.message}`)
      return false
    }
    
    // Determine which asset corresponds to which token
    token0Amount = poolInfo.assets[0].amount
    token1Amount = poolInfo.assets[1].amount
    if ((poolInfo.assets[1].info.native_token?.denom === record.token0) || 
        (poolInfo.assets[1].info.token?.contract_addr === record.token0)) {
      token0Amount = poolInfo.assets[1].amount
      token1Amount = poolInfo.assets[0].amount
    }
    
    lpAmount = poolInfo.total_share
  }
  
  let needsUpdate = false
  
  // Check if values don't match and update if needed
  if (record.token0Reserve !== token0Amount) {
    logger.info(`Updating pair ${record.pair} token0 reserve: ${record.token0Reserve} -> ${token0Amount}`)
    record.token0Reserve = token0Amount
    needsUpdate = true
  }
  
  if (record.token1Reserve !== token1Amount) {
    logger.info(`Updating pair ${record.pair} token1 reserve: ${record.token1Reserve} -> ${token1Amount}`)
    record.token1Reserve = token1Amount
    needsUpdate = true
  }
  
  if (record.totalLpTokenShare !== lpAmount) {
    logger.info(`Updating pair ${record.pair} LP token share: ${record.totalLpTokenShare} -> ${lpAmount}`)
    record.totalLpTokenShare = lpAmount
    needsUpdate = true
  }
  
  // Save the record if it was updated
  if (needsUpdate) {
    // Determine the entity type and save
    if (record instanceof PairHourDataEntity) {
      await manager.getRepository(PairHourDataEntity).save(record)
    } else if (record instanceof PairDayDataEntity) {
      await manager.getRepository(PairDayDataEntity).save(record)
    }
    return true
  }
  
  return false
}

// Use the existing validation exception set from common.ts
const validationExceptionSet: Set<string> = new Set(ClassicOddTokenAppliedPair)

export async function updateTokensPairs(terraswap: ColumbusTerraswap | PhoenixTerraswap): Promise<{pairsAdded: number, tokensAdded: number}> {
  logger.info('Starting pairs and tokens update process')
  
  // Initialize tracking
  const tokenList: Record<string, boolean> = {}
  const pairList: Record<string, boolean> = {}
  let pairsAdded = 0
  let tokensAdded = 0
  
  const allPairs = await terraswap.getAllPairs()
  logger.info(`Retrieved ${allPairs.length} pairs from Terraswap`)
  
  // Get existing pairs from DB
  const existingPairs = await getManager().getRepository(PairInfoEntity).find()
  const existingPairAddresses = existingPairs.map(pair => pair.pair)
  
  // Get existing tokens from DB
  const existingTokens = await getManager().getRepository(TokenInfoEntity).find()
  const existingTokenAddresses = existingTokens.map(token => token.tokenAddress)
  
  // Process each pair
  await getManager().transaction(async (manager: EntityManager) => {
    for (const pair of allPairs) {
      // Check if pair already exists in DB
      if (!existingPairAddresses.includes(pair.addr)) {
        // Get contract info to retrieve token addresses
        try {
          const pairInfo = pair
          
          if (!pairInfo || !pairInfo.assets || pairInfo.assets.length !== 2) {
            logger.warn(`Invalid pair info for ${pair.addr}, skipping`)
            continue
          }
          
          // Extract token addresses from assets
          const token0Address = pairInfo.assets[0].addr
          const token1Address = pairInfo.assets[1].addr
          
          // Order tokens according to protocol rules
          const [asset0, asset1] = isTokenOrderedWell([token0Address, token1Address]) ? 
            [token0Address, token1Address] : 
            [token1Address, token0Address]
          
          // Get LP token address
          const lpTokenAddress = pairInfo.lp || ""
          
          // Add tokens if they don't exist
          if (!existingTokenAddresses.includes(asset0) && !tokenList[asset0]) {
            await addTokenInfo(tokenList, manager, asset0, pair.addr)
            tokensAdded++
          } else if (!tokenList[asset0]) {
            // Update existing token with new pair relationship
            await updateTokenWithNewPair(manager, asset0, pair.addr)
          }
          
          if (!existingTokenAddresses.includes(asset1) && !tokenList[asset1]) {
            await addTokenInfo(tokenList, manager, asset1, pair.addr)
            tokensAdded++
          } else if (!tokenList[asset1]) {
            // Update existing token with new pair relationship
            await updateTokenWithNewPair(manager, asset1, pair.addr)
          }
          
          // Add the pair
          const transformed = {
            assets: [asset0, asset1],
            pairAddress: pair.addr,
            lpTokenAddress: lpTokenAddress
          }
          
          await addPairInfo(pairList, manager, transformed)
          pairsAdded++
          
          logger.info(`Added new pair: ${asset0}-${asset1} (${pair.addr})`)
        } catch (error) {
          logger.error(`Error processing pair ${pair.addr}: ${error.message}`)
        }
      }
    }
  })
  
  logger.info(`Update complete. Added ${pairsAdded} pairs and ${tokensAdded} tokens.`)
  return { pairsAdded, tokensAdded }
}

// Helper function to update a token with a new pair relationship
async function updateTokenWithNewPair(manager: EntityManager, tokenAddress: string, pairAddress: string): Promise<void> {
  const tokenRepo = manager.getRepository(TokenInfoEntity)
  const token = await tokenRepo.findOne({ where: { tokenAddress } })
  
  if (token && !token.pairs.includes(pairAddress)) {
    token.pairs = [...token.pairs, pairAddress]
    await tokenRepo.save(token)
  }
}

// Import these functions from createPairUpdater.ts or reuse them here
async function addTokenInfo(
  tokenList: Record<string, boolean>,
  manager: EntityManager,
  tokenAddress: string,
  newPair: string
): Promise<TokenInfoEntity> {
  const tokenRepo = manager.getRepository(TokenInfoEntity)
  const token = await tokenRepo.findOne({ where: [{ tokenAddress }] })

  if (token === undefined) {
    // new one
    const tokenInfoFromBlockData = await lcd.getTokenInfo(tokenAddress)

    if (!tokenInfoFromBlockData) return undefined

    tokenList[tokenAddress] = true

    const tokenInfo = new TokenInfoEntity({
      tokenAddress,
      symbol: tokenInfoFromBlockData.symbol,
      pairs: [newPair],
      decimals: tokenInfoFromBlockData.decimals,
    })

    return tokenRepo.save(tokenInfo)
  } else {
    if (token.pairs.find((v) => {
      return v === newPair
    })) {
      return
    }
    token.pairs = token.pairs.concat([newPair])
    return tokenRepo.save(token)
  }
}

async function addPairInfo(
  pairList: Record<string, boolean>,
  manager: EntityManager,
  transformed: {
    assets: string[]
    pairAddress: string
    lpTokenAddress: string
  }
): Promise<PairInfoEntity> {
  const pairInfoRepo = manager.getRepository(PairInfoEntity)

  pairList[transformed.pairAddress] = true

  const token0 = isTokenOrderedWell(transformed.assets)
    ? transformed.assets[0]
    : transformed.assets[1]

  const token1 = isTokenOrderedWell(transformed.assets)
    ? transformed.assets[1]
    : transformed.assets[0]

  const pairInfo = new PairInfoEntity({
    pair: transformed.pairAddress,
    token0,
    token1,
    lpToken: transformed.lpTokenAddress,
  })

  return pairInfoRepo.save(pairInfo)
}
