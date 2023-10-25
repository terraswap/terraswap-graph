import { ReturningLogFinderMapper, createReturningLogFinder } from "@terra-money/log-finder"
import { TxHistoryTransformed } from "types"
import logRules from "./log-rules"

export function createInitialProvideFinder(
    pairAddresses: Record<string, boolean>
  ): ReturningLogFinderMapper<TxHistoryTransformed> {
    return createReturningLogFinder(logRules.initialProvideRule(), (_, match) => {
      let to = ''
      let amount = ''
  
      match.forEach((m) => {
        if (m.key == "to") {
          to = m.value
        }
        if (m.key == "amount") {
          amount = m.value
        }
      })
      if (!pairAddresses[to]) {
        return
      }
  
      return {
        pair: to,
        action: 'initial_provide',
        assets: [{ token: '', amount: '0', }, { token: '', amount: '0', }],
        share: amount,
      }
    })
  }
  
