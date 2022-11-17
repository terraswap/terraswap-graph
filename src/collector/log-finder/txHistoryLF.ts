import { createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { trimAssets, addMinus } from 'lib/utils'
import { TxHistoryTransformed } from 'types'
import logRules from './log-rules'

function createLegacySPWFinder(
  pairAddresses: Record<string, boolean>
): ReturningLogFinderMapper<TxHistoryTransformed> {
  return createReturningLogFinder(logRules.spwRule(), (_, match) => {
    if (pairAddresses[match[0].value]) {
      const action = match[1].value
      let assets = [
        {
          token: '',
          amount: '',
        },
        {
          token: '',
          amount: '',
        },
      ]
      let share = '0'

      if (action == 'swap') {
        assets[0].token = match[2].value
        assets[0].amount = match[4].value
        assets[1].token = match[3].value
        assets[1].amount = addMinus(match[5].value)
      } else if (action == 'provide_liquidity') {
        assets = trimAssets(match[2].value, true)
        share = match[3].value
      } else if (action == 'withdraw_liquidity') {
        assets = trimAssets(match[3].value, false)
        share = match[2].value
      }

      const transformed = {
        pair: match[0].value,
        action: match[1].value,
        assets,
        share,
      }

      return transformed
    }
    return
  })
}


 function createNewSPWFinder(
  pairAddresses: Record<string, boolean>
): ReturningLogFinderMapper<TxHistoryTransformed> {
  return createReturningLogFinder(logRules.spwRule(), (_, match) => {
    if (pairAddresses[match[0].value]) {
      const action = match[1].value
      let assets = [
        {
          token: '',
          amount: '',
        },
        {
          token: '',
          amount: '',
        },
      ]
      let share = '0'

      if (action === 'swap') {
        assets[0].token = match[4].value
        assets[0].amount = match[6].value
        assets[1].token = match[5].value
        assets[1].amount = addMinus(match[7].value)
      } else if (action === 'provide_liquidity') {
        assets = trimAssets(match[4].value, true)
        share = match[5].value
      } else if (action === 'withdraw_liquidity') {
        assets = trimAssets(match[4].value, false)
        share = match[3].value
      }

      const transformed = {
        pair: match[0].value,
        action: match[1].value,
        assets,
        share,
      }

      return transformed
    }
    return
  })
}

export const createSPWFinder =  process.env.TERRA_CHAIN_ID === "columbus-4" ? createLegacySPWFinder : createNewSPWFinder