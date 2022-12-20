import { IsString, IsNumberString, IsOptional } from 'class-validator'

export enum TerraswapAction {
  Swap = 'swap',
  Provide = 'provide_liquidity',
  Withdraw = 'withdraw_liquidity',
  Route = 'route',
}

export enum PairQueryUnit {
  Hour = 'hour',
  Day = 'day',
  Week = 'week',
}

export enum QueryUnit {
  Day = 'day',
  Week = 'week',
  Month = 'month',
}

export class TokenDto {
  @IsString()
  tokenAddress: string

  @IsString()
  symbol: string

  @IsOptional()
  @IsString()
  price?: string

  @IsString({ each: true })
  includedPairs?: string[]
}

export class Volume24hDto {
  @IsNumberString()
  token0Volume: string

  @IsNumberString()
  token1Volume: string

  @IsNumberString()
  volumeUST: string
}
