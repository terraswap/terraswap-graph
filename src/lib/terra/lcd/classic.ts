import axios, { AxiosRequestConfig } from 'axios'
import * as http from 'http';
import * as https from 'https';
import { isNative } from 'lib/utils';
import { Lcd, LcdContractMsgSenderRes, PoolInfo, TokenInfo } from './interfaces';

export class ClassicLcd implements Lcd {
  constructor(url?: string, config?: AxiosRequestConfig) {
    if (url) {
      this.lcdUrl = url
    }
    const defaultConfig = {
      baseURL: this.lcdUrl,
      httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
      httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
      timeout: 2 * 1000,
    }
    this.lcd = axios.create({
      ...defaultConfig,
      ...config,
    })
  }

  private lcdUrl = process.env.TERRA_LCD || 'https://columbus-lcd.terra.dev'

  private lcd = axios.create({
    baseURL: this.lcdUrl,
    httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
    httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
    timeout: 2 * 1000,
  })

  async getLatestBlockHeight(): Promise<number> {
    try {
      const res = await this.lcd.get(`${this.lcdUrl}/blocks/latest`)
      return parseInt(res.data.block.header.height)
    } catch (err) {
      throw new Error(`latestBlockHeight: ${err}`)
    }
  }

  async getTokenInfo(address: string): Promise<TokenInfo> {
    if (isNative(address)) {
      return {
        symbol: address,
        decimals: 6,
      }
    }

    try {
      const query_data = Buffer.from('{"token_info":{}}').toString("base64")
      const result = await this.lcd.get(`${this.lcdUrl}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`)
      return result.data?.data
    } catch (err: any) {
      if (err.isAxiosError && err.response?.status === 500) {
        const res = err.response.data
        if (res.code !== 0 && res.message?.includes('contract query failed: unknown request')) {
          return undefined
        }
      }
      throw err
    }
  }

  async getPoolInfo(address: string, height?: number): Promise<PoolInfo> {
    let headers = {}
    if (height) {
      headers = {
        'x-cosmos-block-height': height,
      }
    }

    try {
      const query_data = Buffer.from('{"pool":{}}').toString("base64")
      const result = await this.lcd.get(`${this.lcdUrl}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`, {
        headers
      })
      return result.data?.data
    } catch (err: any) {
      if (err.isAxiosError && err.response?.status === 500) {
        const res = err.response.data
        if (res.code !== 0 && res.message?.includes('contract query failed: unknown request')) {
          return undefined
        }
      }
      throw err
    }
  }

  async getContractMsgSender(hash: string, contract: string): Promise<string> {
    try {
      const result = await this.lcd.get<LcdContractMsgSenderRes>(`${this.lcdUrl}/cosmos/tx/v1beta1/txs/${hash}`)
      let sender: string;
      let found = false;
      for (let i = 0; i < result.data?.tx?.body?.messages.length && !found; i++) {
        const msg = result.data?.tx?.body?.messages[i]
        // maybe this msg execute the contract
        if (!found && msg["@type"]?.includes("Contract")) {
          sender = msg.sender
        }
        // contract direct msg
        if (msg.contract === contract) {
          sender = msg.sender
          found = true
        }
      }
      return sender
    } catch (err: any) {
      if (err.isAxiosError && err.response?.status === 500) {
        const res = err.response.data
        if (res.code !== 0 && res.message?.includes('contract query failed: unknown request')) {
          return undefined
        }
      }
      throw err
    }
  }
}
