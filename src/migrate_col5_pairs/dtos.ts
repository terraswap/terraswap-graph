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
  query_result: {
    assets: AssetInfoDto[]
    total_share: string
  }
  datetimeString?: string
  height?: number
}

export function getAssetId(asset: Asset): string {
  return asset.native_token ? asset.native_token.denom : asset.token.contract_addr
}
