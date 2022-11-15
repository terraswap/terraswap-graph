import { hashToHex } from '@terra-money/terra.js'
import { Tx } from 'types'

import { rpc } from './rpc'

interface querier {
  getTxsByHeight(height: number): Promise<Tx[]>
}

const querier = {
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
}

export async function getTxsByHeight(height: number): Promise<Tx[]> {
  return await querier.getTxsByHeight(height)
}
