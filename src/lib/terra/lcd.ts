import axios from 'axios'
import * as http from 'http';
import * as https from 'https';
import { isNative } from 'lodash';

interface TokenInfo {
  symbol: string
  decimals: number
}

const lcdUrl = process.env.TERRA_LCD || 'https://bombay-lcd.terra.dev'

const lcdClient = axios.create({
  baseURL: lcdUrl, 
  httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5*1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
  timeout: 2 * 1000,
})

export async function getLatestBlockHeight(): Promise<number> {
  try {
    const res = await lcdClient.get(`/blocks/latest`)
    return parseInt(res.data.block.header.height)
  } catch (err) {
    console.log(err)
    throw new Error(`cannot get latest block height`)
  }
}

export async function getTokenInfo(address: string): Promise<TokenInfo> {
  if (isNative(address)) {
    return {
      symbol: address,
      decimals: 6,
    }
  }

  const result = await lcdClient.get(`terra/wasm/v1beta1/contracts/${address}/store`,
  {
    params: {
      query_msg: 'eyJ0b2tlbl9pbmZvIjp7fX0='
    }
  })

  return result.data?.query_result
}
