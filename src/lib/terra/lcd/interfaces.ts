
export interface TokenInfo {
  symbol: string
  decimals: number
}


export interface PoolInfo {
  assets: any[2]
  total_share: string
}
export interface Lcd {
  getLatestBlockHeight(currentHeight?: number): Promise<number>
  getTokenInfo(address: string): Promise<TokenInfo>
  getPoolInfo(address: string, height?: number): Promise<PoolInfo>
  getContractMsgSender(hash: string, contract: string): Promise<string>
}

export interface LcdContractMsgSenderRes {
  tx: {
    body: {
      messages: {
        '@type': string
        sender: string
        contract?: string
      }[]
    }
  }
  tx_response: {
    height: string
    txhash: string
  }
}