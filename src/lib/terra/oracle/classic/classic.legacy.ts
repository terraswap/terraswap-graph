import { delay } from 'bluebird'
import { num } from 'lib/num'
import { ExchangeRate } from 'types'
import { Oracle } from '../interfaces'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders } from 'axios'
import * as http from 'http';
import * as https from 'https';

export class ClassicLegacyOracle implements Oracle {
  private url = process.env.TERRA_LCD ?? "http://localhost:1317"
  private client: AxiosInstance

  constructor(url?: string, config?: AxiosRequestConfig) {
    if (url) {
      this.url = url
    }
    const defaultConfig = {
      baseURL: this.url,
      httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
      httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
      timeout: 10 * 1000,
    }
    this.client = axios.create({
      ...defaultConfig,
      ...config,
    })
  }

  async getExchangeRate(height: number): Promise<ExchangeRate> {
    let tryCount = 5;
    let index = 0
    if (Number(process.env.START_BLOCK_HEIGHT) + 100 > height) height += 100
    while (tryCount) {
      const res = await this.getFromLCD(
        '/oracle/denoms/exchange_rates?height=' + (height - index * 100).toString()
      )
      if (res?.result) {
        return res
      }
      index++
      tryCount--
    }
    throw new Error('Failed to get exchange rate')
  }

  async exchangeRateToUSX(
    denom: string,
    inputExchangeRate: ExchangeRate | undefined
  ): Promise<string | undefined> {
    let exchangeRate = inputExchangeRate
    if (!exchangeRate) return
    if (denom === 'uluna') return exchangeRate.result.filter((e) => e.denom === 'uusd')[0].amount
    if (!exchangeRate.result.filter((e) => e.denom === denom)[0]) {
      while (!exchangeRate.result.filter((e) => e.denom === denom)[0]) {
        exchangeRate = await this.getExchangeRate(Number(exchangeRate.height) - 100)
        if (denom === 'uust') {
          return '0'
        }
      }
    }
    if (denom === 'uusd') return '1'
    const uusdRate = exchangeRate.result.filter((e) => e.denom === 'uusd')[0].amount
    const targetDenomRate = exchangeRate.result.filter((e) => e.denom === denom)[0].amount
    return num(uusdRate).div(targetDenomRate).toString()
  }

  private async getFromLCD(path: string, headers?: AxiosRequestHeaders): Promise<ExchangeRate> {
    let got = false
    while (!got) {
      try {
        const res = await this.client.get(this.url + path, {
          headers: {
            accept: 'application/json',
            ...headers
          },
        }).catch()
        got = true
        return {
          height: headers['x-cosmos-block-height'],
          result: res.data.exchange_rates
        }
      } catch (error) {
        delay(1000)
        throw error
      }
    }
  }
}
