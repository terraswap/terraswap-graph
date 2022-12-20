import 'reflect-metadata'
import * as bluebird from 'bluebird'
import { initORM } from 'orm'
import { init as initErrorHandler, errorHandler, errorHandlerWithSentry } from 'lib/error'
import * as logger from 'lib/logger'
import { validateConfig } from 'config'
import { collect } from './collect'
import config from 'config'
import { getManager } from 'typeorm'
import { getPairList, getTokenList } from './indexer/common'
import initRpc from 'lib/terra/rpc'

bluebird.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

async function loop(
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>
): Promise<void> {
  for (; ;) {
    await collect(pairList, tokenList).catch(errorHandlerWithSentry)
    await bluebird.delay(500)
  }
}

async function main(): Promise<void> {
  logger.info(`Initialize collector, start_block_height: ${config.START_BLOCK_HEIGHT}`)

  initErrorHandler({ sentryDsn: process.env.SENTRY })

  validateConfig()

  await initORM()

  initRpc(process.env.TERRA_RPC)

  const manager = getManager()

  const pairList = await getPairList(manager)

  const tokenList = await getTokenList(manager)

  logger.info('Start collecting')

  await loop(pairList, tokenList)
}

if (require.main === module) {
  main().catch(errorHandler)
}
