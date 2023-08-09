export interface fcd {
  getContractMsgSender(hash: string, contract: string): Promise<string>
}

export interface FcdContractMsgSenderRes {
  tx: {
    value: {
      msg: {
        'type': string
        value: {
          sender: string
          contract?: string
        }
      }[]
    }
  }
  height: string
  txhash: string
}