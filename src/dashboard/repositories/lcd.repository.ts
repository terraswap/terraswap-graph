import { InternalServerErrorException, Logger } from '@nestjs/common'
import { getFromLCD } from 'lib/terra'
import { ExchangeRate } from 'types'

export class DashboardLcdRepository {
  async getExchangeRate(): Promise<ExchangeRate> {
    try {
      return await getFromLCD('/oracle/denoms/exchange_rates')
    } catch (err: any) {
      Logger.warn(err.stack ? err.stack : err)
      throw new InternalServerErrorException()
    }
  }
}
