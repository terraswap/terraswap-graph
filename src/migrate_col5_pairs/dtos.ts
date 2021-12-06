export interface Asset {
  native_token?: {
    denom: string
  }
  token?: {
    contract_addr: string
  }
}

export interface AssetInfoDto {
  info: Asset
  amount: string
}

export interface PoolInfoDto {
  height: number
  result: {
    assets: AssetInfoDto[]
    total_share: string
  }
  timestamp?: Date
}

export function getAssetId(asset: Asset) {
  return asset.native_token ? asset.native_token.denom : asset.token.contract_addr
}
