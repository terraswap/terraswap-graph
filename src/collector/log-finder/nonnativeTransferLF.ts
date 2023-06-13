import { Attributes, createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { NonnativeTransferTransformed } from 'types'
import logRules from './log-rules'
import { num } from 'lib/num'

export function createNonnativeTransferLogFinder(): ReturningLogFinderMapper<NonnativeTransferTransformed> {
  return createReturningLogFinder(logRules.nonnativeTransferRule(), (_, match) => {
    if (match[4]?.key === 'by') {
      return columbus4Mapper(match)
    }

    if (match[5]?.key === 'fee_amount') {
      return tflokiMapper(match)
    }

    return defaultMapper(match)
  })
}

function tflokiMapper(match: Attributes): NonnativeTransferTransformed {
  const transformed = {
    addresses: { from: "", to: "" },
    assets: { token: "", amount: "" },
  }
  let feeAmount = "0";
  match.forEach(m => {
    if (m.key === "from") {
      transformed.addresses.from = m.value
    }
    if (m.key === "to") {
      transformed.addresses.to = m.value
    }
    if (m.key === "_contract_address" || m.key === "contract_address") {
      transformed.assets.token = m.value
    }
    if (m.key === "amount") {
      transformed.assets.amount = m.value
    }
    if (m.key === "fee_amount") {
      feeAmount = m.value
    }
  })
  transformed.assets.amount = num(transformed.assets.amount).minus(num(feeAmount)).toString()
  return transformed
}



function defaultMapper(match: Attributes): NonnativeTransferTransformed {
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
    if (m.key === "_contract_address" || m.key === "contract_address") {
      transformed.assets.token = m.value
    }
    if (m.key === "amount") {
      transformed.assets.amount = m.value
    }
  })
  return transformed
}

function columbus4Mapper(match: Attributes): NonnativeTransferTransformed {
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