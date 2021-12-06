import axios from 'axios'
import { delay } from 'bluebird';
import * as http from 'http';
import * as https from 'https';

import { PoolInfoDto } from '../dtos'

const lcdUrl = process.env.TERRA_LCD || 'https://lcd.terra.dev'
const wasmBasePath = `/wasm/contracts/pairAddress/store?query_msg={"pool":{}}`
const blockBasePath = `/blocks/height`
const lunaUsdPair = 'terra1tndcaqxkpc5ce9qee5ggqf430mr2z3pefe5wj6'
const lcdClient = axios.create({
  baseURL: lcdUrl, 
  httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5*1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
  timeout: 2 * 1000,
})

export async function getLatestBlockHeight(): Promise<number> {
  const path = wasmBasePath.replace('pairAddress', lunaUsdPair)
  try {
    const res = await await lcdClient.get(path)
    return parseInt(res.data.height)
  } catch (err) {
    console.log(err)
    throw new Error(`cannot get latest block height`)
  }
}

export async function getPoolInfo(pairAddress: string, height?: number): Promise<PoolInfoDto> {
  let path = wasmBasePath.replace('pairAddress', pairAddress)
  if (height) {
    path = path + `&&height=${height}`
  }
  try {
    const res = await lcdClient.get(path)
    return res.data
  } catch (err) {
    console.log(err)
    await delay(100)
  }
}

export async function getBlockTime(height: number): Promise<Date> {
  const path = blockBasePath.replace('height', height + '')
  try {
    const res = await lcdClient.get(path)
    return res?.data?.block.header.time
  } catch (err) {
    console.log(err)
  }
}
