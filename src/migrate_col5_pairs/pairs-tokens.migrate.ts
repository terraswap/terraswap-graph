import * as fs from 'fs'
import { isTokenOrderedWell } from 'lib/utils'
import { PairInfoEntity, TokenInfoEntity } from 'orm'

import { EntityManager, getConnection } from 'typeorm'

function setPairs(token: string, pair: string, tokenToPairMap: Map<string, string[]>) {

  const pairs = tokenToPairMap.get(token) || []
  pairs.push(pair)
  tokenToPairMap.set(token, pairs)
}

function getAssetId(assetInfo: any) {
  return assetInfo.native_token ? assetInfo.native_token.denom : assetInfo.token.contract_addr
}

async function loadPairs() {
  return JSON.parse(fs.readFileSync(`${__dirname}/mainnet-pairs.json`).toString())
}

async function loadTokens() {
  return JSON.parse(fs.readFileSync(`${__dirname}/mainnet-tokens.json`).toString())
}

export async function migrateData(): Promise<void> {
  const tokens = await loadTokens()
  const pairs = await loadPairs()
  await getConnection().transaction(async (manager: EntityManager) => {
    const pairRepo = manager.getRepository(PairInfoEntity)
    const tokenRepo = manager.getRepository(TokenInfoEntity)
    const tokenToPairMap: Map<string, string[]> = new Map<string, string[]>()

    const pairEntities = pairs.map((p: any) => {
      const assets = [getAssetId(p.asset_infos[0]), getAssetId(p.asset_infos[1])]
      const token0 = isTokenOrderedWell(assets) ? assets[0] : assets[1]
      const token1 = isTokenOrderedWell(assets) ? assets[1] : assets[0]

      const entity = pairRepo.create({
        lpToken: p.liquidity_token,
        pair: p.contract_addr,
        token0,
        token1,
      })
      setPairs(entity.token0, entity.pair, tokenToPairMap)
      setPairs(entity.token1, entity.pair, tokenToPairMap)
      setPairs(entity.lpToken, entity.pair, tokenToPairMap)

      return entity
    })

    const tokenEntities: TokenInfoEntity[] = []
    tokens.forEach((t: any) => {
      const pairs = tokenToPairMap.get(t.contract_addr)
      if (!pairs) {
        return
      }

      tokenEntities.push(
        tokenRepo.create({
          decimals: t.decimals,
          pairs,
          symbol: t.symbol,
          tokenAddress: t.contract_addr,
        })
      )
    })

    await pairRepo.save(pairEntities)
    await tokenRepo.save(tokenEntities)
  })
}
