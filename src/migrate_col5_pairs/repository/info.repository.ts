import axios from 'axios'
import { delay } from 'bluebird'
import * as http from 'http'
import * as https from 'https'
import { stringToDate } from 'lib/utils'
import { START_BLOCK_HEIGHT } from 'migrate_col5_pairs/overwrite'
import { Cycle } from 'types'

import { PoolInfoDto } from '../dtos'

const lcdUrl = process.env.TERRA_LCD || 'https://lcd.terra.dev'
const wasmBasePath = `/terra/wasm/v1beta1/contracts/pairAddress/store?query_msg=eyJwb29sIjp7fX0=`
const blockBasePath = `/blocks/height`
const lcdClient = axios.create({
  baseURL: lcdUrl,
  httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
  timeout: 2 * 1000,
})

export async function getLatestBlockHeight(): Promise<number> {
  try {
    const res = await await lcdClient.get(`/blocks/latest`)
   return parseInt(res.data.block.header.height)
  } catch (err) {
    console.log(err)
    throw new Error(`cannot get latest block height`)
  }
}

export async function getPoolInfo(pairAddress: string, height?: number): Promise<PoolInfoDto> {
  const path = wasmBasePath.replace('pairAddress', pairAddress)
  let headers
  if (height) {
    headers = {
      'x-cosmos-block-height': `${height}`,
    }
  }
  try {
    const res = await lcdClient.get(path, {
      headers,
    })
    return res.data
  } catch (err) {
    console.log(err)
    await delay(100)
  }
}

export async function getBlockTime(height: number): Promise<string> {
  const path = blockBasePath.replace('height', height + '')
  try {
    const res = await lcdClient.get(path)
    return res?.data?.block.header.time
  } catch (err) {
    console.log(err)
  }
}

export async function getBlockHeightByTime(targetTimestamp: number, cycle: Cycle): Promise<number> {
  const path = blockBasePath.replace('height', 'latest')
  const res = await lcdClient.get(path)

  let r = parseInt(res?.data?.block.header.height)
  let l = START_BLOCK_HEIGHT

  try {
    while (l < r) {
      const m = Math.floor((r + l) / 2)
      const path = blockBasePath.replace('height', `${m}`)
      const res = await lcdClient.get(path)
      const time = res?.data?.block.header.time

      const blockTime = stringToDate(time, cycle).getTime()
      if (blockTime === targetTimestamp) {
        return m
      } else if (blockTime < targetTimestamp) {
        l = m + 1
      } else {
        r = m - 1
      }
    }
  } catch (err) {
    console.log(err)
  }
  return l
}
