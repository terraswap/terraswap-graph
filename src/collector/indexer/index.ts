import { EntityManager } from 'typeorm'
import { Tx, ExchangeRate } from 'types'
import { generateTerraswapRow } from './txHistoryUpdater'
import { createCreatePairLogFinders, createSPWFinder, createNativeTransferLogFinders, createNonnativeTransferLogFinder, createInitialProvideFinder } from '../log-finder'
import { CreatePairIndexer } from './createPairIndexer'
import { InitialProvideIndexer, TxHistoryIndexer } from './txHistoryIndexer'
import { NativeTransferIndexer, NonnativeTransferIndexer } from './transferIndexer'
import { factoryAddress } from 'lib/terraswap/'
import logRules from '../log-finder/log-rules'
import { EventKV } from '@terra-money/terra.js'


function sortNativeTransferAttributes(attrs: EventKV[]): EventKV[] {
  let startIdx = 0
  const splitEvery = 3
  const sorted: EventKV[] = []

  while (startIdx < attrs.length) {
    sorted.push(...(attrs.slice(startIdx, startIdx + splitEvery).sort((a, b) => a.key < b.key ? -1 : 1)))
    startIdx += splitEvery
  }
  return sorted
}

export async function runIndexers(
  manager: EntityManager,
  txs: Tx[],
  exchangeRate: ExchangeRate | undefined,
  pairList: Record<string, boolean>,
  tokenList: Record<string, boolean>,
  height: number
): Promise<void> {
  for (const tx of txs) {
    const Logs = tx.logs
    const timestamp = tx.timestamp
    const txHash = tx.txhash

    for (const log of Logs) {
      const events = log.events

      for (const event of events) {
        // for spam tx
        if (logRules.isParsable(event.type)) {
          // createPair
          const createPairLogFounds = createCreatePairLogFinders(factoryAddress, height)(event)
          createPairLogFounds.length > 0 && await CreatePairIndexer(pairList, tokenList, manager, timestamp, createPairLogFounds)

          // txHistory
          const spwfLF = createSPWFinder(pairList, height)
          const spwfLogFounds = spwfLF(event)

          const ipLogFounds = createInitialProvideFinder(pairList)(event).filter(ip => ip.transformed)
          await InitialProvideIndexer(manager, ipLogFounds)

          if (spwfLogFounds.length > 0) {
            await TxHistoryIndexer(manager, exchangeRate, timestamp, txHash, spwfLogFounds)
          }

          if (event.type === "transfer") {
            event.attributes = sortNativeTransferAttributes(event.attributes)
            // native transfer
            const nativeTransferLogFounds = createNativeTransferLogFinders(height)(event)

            await NativeTransferIndexer(pairList, manager, exchangeRate, timestamp, nativeTransferLogFounds)
          }

          // nonnative transfer
          const nonnativeTransferLogFounds = createNonnativeTransferLogFinder(height)(event)

          await NonnativeTransferIndexer(pairList, tokenList, manager, timestamp, exchangeRate, nonnativeTransferLogFounds)
        }
      }
    }
  }

  if (txs[0]) {
    generateTerraswapRow(txs[0].timestamp, manager)
  }
}
