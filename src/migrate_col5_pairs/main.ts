import { initORM } from 'orm'
import { migratePairsInfo } from './initial-pair-info.migrate'
import { migrateData } from './pairs-tokens.migrate'

const chainId = process.env.TERRA_CHAIN_ID || 'columbus-5'
const col5 = {
  chainId,
  startHeight: 4724000,
}

const config = col5

export const TERRA_CHAIN_ID = config.chainId
export const START_BLOCK_HEIGHT = config.startHeight

async function run() {
  await initORM()
  await migrateData()
  await migratePairsInfo()
}

run().catch((err) => {
  console.error(err)
})
