import { AxiosInstance } from 'axios'
import { isNative } from 'lib/utils';
import { Lcd, LcdContractMsgSenderRes, PoolInfo, TokenInfo } from '../interfaces';

export class ClassicCosmos45Lcd implements Lcd {
  static version = /^v0\.4[0-5]\.\d+/
  private url: string;
  private client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.url = client.defaults.baseURL
    this.client = client
  }

  async getLatestBlockHeight(): Promise<number> {
    try {
      const path = `blocks/latest`
      const res = await this.client.get(`${this.url}/${path}`)
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
      const result = await this.client.get(`${this.url}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`)
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
      const result = await this.client.get(`${this.url}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`, {
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
      const result = await this.client.get<LcdContractMsgSenderRes>(`${this.url}/cosmos/tx/v1beta1/txs/${hash}`)
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
