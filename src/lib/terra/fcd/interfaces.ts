export interface fcd {
  getContractMsgSender(hash: string, contract: string): Promise<string>
}

export interface FcdContractMsgSenderRes {
  tx: {
    body: {
      messages: {
        '@type': string
        sender: string
        contract?: string
      }[]
    }
  }
  height: string
  txhash: string
}