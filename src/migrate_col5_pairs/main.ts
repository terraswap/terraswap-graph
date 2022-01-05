import { initORM } from 'orm'
import { migratePairsInfo } from './initial-pair-info.migrate'
import { migrateData } from './pairs-tokens.migrate'

const chainId = process.env.TERRA_CHAIN_ID || 'columbus-5'
const col5 = {
  chainId,
  startHeight: 4724000,
  lunaUsdPair: 'terra1tndcaqxkpc5ce9qee5ggqf430mr2z3pefe5wj6',
}
const bombay12 = {
  chainId,
  startHeight: 5900000,
  lunaUsdPair: 'terra156v8s539wtz0sjpn8y8a8lfg8fhmwa7fy22aff',
}

const isMainnet = chainId.startsWith('col')
const config = isMainnet ? col5 : bombay12

export const TERRA_CHAIN_ID = config.chainId
export const START_BLOCK_HEIGHT = config.startHeight
export const LUNA_USD_PAIR = config.lunaUsdPair

async function run() {
  await initORM()
  await migrateData()
  await migratePairsInfo()
}

run().catch((err) => {
  console.error(err)
})
