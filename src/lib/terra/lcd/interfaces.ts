
export interface TokenInfo {
  symbol: string
  decimals: number
}


export interface PoolInfo {
  assets: any[2]
  total_share: string
}
export interface Lcd {
  getLatestBlockHeight(): Promise<number>
  getTokenInfo(address: string): Promise<TokenInfo>
  getPoolInfo(address: string, height?: number): Promise<PoolInfo>
}
