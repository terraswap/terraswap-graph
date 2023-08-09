export interface fcd {
  getContractMsgSender(hash: string, contract: string): Promise<string>
}

export interface ClassicFcdContractMsgSenderRes {
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

export interface MainnetFcdContractMsgSenderRes {
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