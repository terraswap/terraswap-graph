
export interface TokenInfo {
  symbol: string
  decimals: number
}

export interface Lcd {
  getLatestBlockHeight(): Promise<number>
  getTokenInfo(address: string): Promise<TokenInfo>
}