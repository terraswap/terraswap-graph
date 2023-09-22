
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
export interface NodeInfoResponse {
  default_node_info?: any
  application_version: {
    name?: string
    app_name?: string
    version?: string
    git_commit?: string
    build_tags?: string
    go_version?: string
    build_deps?: {
      path: string
      version: string
      sum: string
    }[]
    cosmos_sdk_version?: string
  }
}
