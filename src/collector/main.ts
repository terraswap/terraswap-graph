import 'reflect-metadata'
import * as bluebird from 'bluebird'
import { initORM } from 'orm'
import { init as initErrorHandler, errorHandlerWithSentry } from 'lib/error'
import * as logger from 'lib/logger'
import { validateConfig } from 'config'
import { collect } from './collect'
import * as http from 'http'
import * as https from 'https'
import { getManager } from 'typeorm'
import { getPairList, getTokenList } from './indexer/common'
import initRpc from 'lib/terra/rpc'
import initLcd from 'lib/terra/lcd'
import initOracle from 'lib/terra/oracle'
import axios, { AxiosInstance } from 'axios'


bluebird.config({ longStackTraces: true, warnings: { wForgottenReturn: false } })
global.Promise = bluebird as any // eslint-disable-line

async function loop(
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>
): Promise<void> {
  const MAX_EXPONENTIAL_FACTOR = 2
  const delay = 500
  let errCount = 0
  for (; ;) {
    try {
      await collect(pairList, tokenList)
      errCount = 0
    } catch (err: any) {
      errorHandlerWithSentry(err)
      errCount++
    }
    if (errCount > MAX_EXPONENTIAL_FACTOR) {
      throw new Error("Too many errors, exiting...")
    }
    await bluebird.delay(delay * 2 ** errCount)
  }
}

async function main(): Promise<void> {
  logger.info(`Initialize collector`)

  initErrorHandler({ sentryDsn: process.env.SENTRY_DSN })

  validateConfig()

  await initORM()

  initRpc(process.env.TERRA_RPC)

  const httpClient: AxiosInstance = axios.create({
    baseURL: process.env.TERRA_LCD,
    httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
    httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
    timeout: 10 * 1000,
  })
  await initOracle(httpClient)
  await initLcd(httpClient)

  const manager = getManager()

  const pairList = await getPairList(manager)

  const tokenList = await getTokenList(manager)

  logger.info('Start collecting')

  await loop(pairList, tokenList)
}

if (require.main === module) {
  main().catch(errorHandlerWithSentry)
}
