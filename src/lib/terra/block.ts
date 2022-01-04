import { gql } from 'graphql-request'
import { Tx } from 'types'
import { getLatestBlockHeight } from './lcd'
import { mantle } from './mantle'
import { mantleMint } from './mantlemint'

interface querier {
  getTxsByHeight(height: number): Promise<Tx[]>
  getLatestBlock(): Promise<number>
}

const bombayQuerier = {
  async getTxsByHeight(height: number): Promise<Tx[]> {
    const response = await mantleMint.get(`/index/tx/by_height/${height}`)
    return JSON.parse(response.data)
  },

  async getLatestBlock(): Promise<number> {
    return await getLatestBlockHeight()
  },
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
