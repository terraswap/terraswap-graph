import { ExchangeRate } from "types"

export interface Oracle {
  getExchangeRate(height: number): Promise<ExchangeRate>
  exchangeRateToUSX(denom: string, inputExchangeRate: ExchangeRate | undefined): Promise<string | undefined>
}
