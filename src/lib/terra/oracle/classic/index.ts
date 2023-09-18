import { ExchangeRate } from 'types'
import { Oracle } from '../interfaces'
import { ClassicCosmos46Oracle } from './classic.cosmos46'
import { ClassicLegacyOracle } from './classic.legacy'


export class ClassicOracle implements Oracle {
  private clients: Oracle[];
  private indicator = 0;

  constructor() {
    this.clients = [
      new ClassicCosmos46Oracle(),
      new ClassicLegacyOracle(),
    ]
  }

  async getExchangeRate(height: number): Promise<ExchangeRate> {
    try {
      return await this.clients[this.indicator].getExchangeRate(height) 
    } catch (err) {
      this.indicator = (this.indicator + 1) % this.clients.length
      return await this.clients[this.indicator].getExchangeRate(height)
    }
  }

  async exchangeRateToUSX(
    denom: string,
    inputExchangeRate: ExchangeRate | undefined
  ): Promise<string | undefined> {
    try {
      return await this.clients[this.indicator].exchangeRateToUSX(denom, inputExchangeRate) 
    } catch (err) {
      this.indicator = (this.indicator + 1) % this.clients.length
      return await this.clients[this.indicator].exchangeRateToUSX(denom, inputExchangeRate)
    }
  }
}

