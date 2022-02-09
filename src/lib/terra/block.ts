import { hashToHex } from '@terra-money/terra.js'
import { gql } from 'graphql-request'
import { Tx } from 'types'
import { getLatestBlockHeight } from './lcd'
import { mantle } from './mantle'
import { rpc } from './rpc'

interface querier {
  getTxsByHeight(height: number): Promise<Tx[]>
  getLatestBlock(): Promise<number>
}

const bombayQuerier = {
  async getTxsByHeight(height: number): Promise<Tx[]> {
    const block = await rpc.get(`/block`, {
      params: { height },
    })

    const blockResults = await rpc.get(`/block_results`, {
      params: { height },
    })
    const blockData = JSON.parse(block.data)
    const txTimestamp = blockData.result.block.header.time

    const blockResultsData = JSON.parse(blockResults.data)
    const txs: Tx[] = []

    blockData.result.block.data.txs.forEach((tx: any, idx: number) => {
      const txString = typeof tx === 'string' ? tx : Buffer.from(tx).toString()
      const txHashStr = hashToHex(txString)
      const txResult = blockResultsData.result?.txs_results[idx]
      let logs = []
      if (txResult.code === 0 ) {
        logs = JSON.parse(txResult.log)
      }
      txs.push({
        height, 
        timestamp: txTimestamp,
        txhash:txHashStr,
        logs
      })
    })
    return txs
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
