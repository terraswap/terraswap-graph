import 'reflect-metadata'
import * as bluebird from 'bluebird'
import { initORM } from 'orm'
import { init as initErrorHandler, errorHandlerWithSentry } from 'lib/error'
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
  const MAX_EXPONENTIAL_FACTOR = 10
  let delay = 500
  let errCount = 0
  for (; ;) {
    try {
      await collect(pairList, tokenList)
      errCount = 0
    } catch (err: any) {
      errorHandlerWithSentry(err)
      errCount = errCount + 1 > MAX_EXPONENTIAL_FACTOR ? 0 : errCount + 1
    }
    delay = delay * 2 ** errCount
    await bluebird.delay(delay)
  }
}

async function main(): Promise<void> {
  logger.info(`Initialize collector, start_block_height: ${config.START_BLOCK_HEIGHT}`)

  initErrorHandler({ sentryDsn: process.env.SENTRY_DSN })

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
  main().catch(errorHandlerWithSentry)
}
