export interface Tx {
  txhash: string
  sender?: string 
  timestamp: string
  height: number
  logs: {
    msg_index: number
    events: Event[]
  }[]
}

export interface Event {
  type: string
  attributes: {
    key: string
    value: string
  }[]
}