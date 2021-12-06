import { gql } from 'graphql-request'
import { Tx } from 'types'
import { mantle } from './mantle'

interface querier {
  getTxsByHeight(height: number): Promise<Tx[]>
  getLatestBlock(): Promise<number>
  getTxsQuery: () => string
  getLatestBlockQuery: () => string
}

const bombayQuerier = {
  async getTxsByHeight(height: number): Promise<Tx[]> {
    const range = [height, height]
    const response = await mantle.request(this.getTxsQuery(), { range })
    return response.Blocks[0]?.Txs
  },

  async getLatestBlock(): Promise<number> {
    const response = await mantle.request(this.getLatestBlockQuery())
    return Number(response?.LastSyncedHeight)
  },

  getTxsQuery: () => gql`
    query ($range: [Int!]!) {
      Blocks(Height_range: $range) {
        Txs {
          Height
          TxHash
          TimestampUTC
          Logs {
            Events {
              Type
              Attributes {
                Key
                Value
              }
            }
          }
          Tx {
            Msg {
              Type
              Value
            }
          }
        }
      }
    }
  `,

  getLatestBlockQuery: () => gql`
    {
      LastSyncedHeight
    }
  `,
}

const mainnetQuerier = {
  async getTxsByHeight(height: number): Promise<Tx[]> {
    const response = await mantle.request(this.getTxsQuery(), { height })
    return response?.tx?.byHeight
  },

  async getLatestBlock(): Promise<number> {
    const response = await mantle.request(this.getLatestBlockQuery())
    return Number(response?.tendermint?.blockInfo?.block?.header?.height)
  },

  getTxsQuery: () => {
    return gql`
      query ($height: Float!) {
        tx {
          byHeight(height: $height) {
            timestamp
            height
            txhash
            logs {
              msg_index
              events {
                type
                attributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    `
  },
  getLatestBlockQuery: () => {
    return gql`
      {
        tendermint {
          blockInfo {
            block {
              header {
                height
              }
            }
          }
        }
      }
    `
  },
}

function queryFactory(network: string): querier {
  if (network?.includes('bombay')) {
    return bombayQuerier
  }
  return mainnetQuerier
}

export async function getTxsByHeight(height: number): Promise<Tx[]> {
  return await queryFactory(process.env.TERRA_CHAIN_ID).getTxsByHeight(height)
}

export async function getLatestBlock(): Promise<number> {
  return await queryFactory(process.env.TERRA_CHAIN_ID).getLatestBlock()
}
