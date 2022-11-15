import { ExchangeRate } from "types"

export interface Oracle {
  getExchangeRate(height: number): Promise<ExchangeRate>
  exchangeRateToUSX(denom: string, inputExchangeRate: ExchangeRate | undefined): Promise<string | undefined>
}



export interface Asset{
  addr: string
  decimals: number
  amount: string
}

export interface Pair {
  assets: Asset[]
  addr: string
  lp: string
  lpAmount: string
}


export interface AssetRes {
  token?: {
    contract_addr: string
  }
  native_token?: {
    denom: string
  }
}

export interface PairRes {
  asset_infos: AssetRes[]
  asset_decimals: [number, number]
  contract_addr: string
  liquidity_token: string
}

export interface AssetInfoRes {
  info: AssetRes
  amount: string
}

export interface PoolInfoRes  {
  assets: AssetInfoRes[]
  total_share: string
}