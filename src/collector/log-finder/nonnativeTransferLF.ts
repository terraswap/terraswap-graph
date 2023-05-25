import { createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { NonnativeTransferTransformed } from 'types'
import logRules from './log-rules'

export function createNonnativeTransferLogFinder(): ReturningLogFinderMapper<NonnativeTransferTransformed> {
  return createReturningLogFinder(logRules.nonnativeTransferRule(), (_, match) => {
    if (match[4]?.key === 'by') {
      return {
        addresses: {
          from: match[2].value,
          to: match[3].value,
        },
        assets: {
          token: match[0].value,
          amount: match[5].value,
        },
      }
    }
    const transformed = {
      addresses: { from: "", to: "" },
      assets: { token: "", amount: "" },
    }
    match.forEach(m => {
      if (m.key === "from") {
        transformed.addresses.from = m.value
      }
      if (m.key === "to") {
        transformed.addresses.to = m.value
      }
      if (m.key === "_contract_address") {
        transformed.assets.token = m.value
      }
      if (m.key === "amount") {
        transformed.assets.amount = m.value
      }
    })
    return transformed
  })
}
