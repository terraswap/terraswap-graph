import { Attributes, createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { NonnativeTransferTransformed } from 'types'
import logRules from './log-rules'
import { BigNumber, num } from 'lib/num'
import { isClassic, isColumbus4 } from 'lib/terra'
import { ClassicReceiverFeeAppliedTokenSet, ClassicReceiverFeeAppliedPairSet, ClassicOddTokenHandlerMap } from 'lib/terraswap/classic.consts'


const FEE_AMOUNT_KEY = 'fee_amount'
const TAX_AMOUNT_KEY = 'tax_amount'
const CW20_TAX_AMOUNT_KEY = 'cw20_tax_amount'
const CW20_TAX_KEY = 'tax'

export function createNonnativeTransferLogFinder(height?: number): ReturningLogFinderMapper<NonnativeTransferTransformed> {
  if (isColumbus4) {
    createCol4LogFinder(height)
  }

  if (isClassic) {
    return createClassicLogFinder(height)
  }

  return createPhoenixLogFinder(height)
}

function createCol4LogFinder(height?: number) {
  return createReturningLogFinder(logRules.nonnativeTransferRule(height), (_, match) => {
    return columbus4Mapper(match)
  })
}

function createClassicLogFinder(height?: number) {
  return createReturningLogFinder(logRules.nonnativeTransferRule(height), (_, match) => {
    const transformed = feeApplyMapper(match)
    if (ClassicReceiverFeeAppliedTokenSet.has(transformed.assets.token) &&
      // if ReceiverFeeAppliedToken is transferred from the pair, the amount need to be adjusted
      ClassicReceiverFeeAppliedPairSet.has(transformed.addresses.from)) {
      const feeAmount = match.find(m => m.key === FEE_AMOUNT_KEY || m.key === TAX_AMOUNT_KEY || m.key === CW20_TAX_AMOUNT_KEY)?.value || "0"
      transformed.assets.amount = num(transformed.assets.amount).plus(num(feeAmount)).toString()
    }

    const oddTokenHandlingInfo = ClassicOddTokenHandlerMap.get(transformed.assets.token)
    if (
      oddTokenHandlingInfo?.pair(transformed.addresses.to) &&
      oddTokenHandlingInfo?.action(match?.find(m => m.key === "action")?.value) &&
      height && height >= oddTokenHandlingInfo?.appliedHeight
    ) {
      transformed.assets.amount = num(transformed.assets.amount).multipliedBy(num("1").minus(num(oddTokenHandlingInfo.feeRate))).integerValue(BigNumber.ROUND_FLOOR).toString()
    }

    return transformed
  })
}

function createPhoenixLogFinder(height?: number) {
  return createReturningLogFinder(logRules.nonnativeTransferRule(height), (_, match) => {
    if (match.find(m => m.key === FEE_AMOUNT_KEY || m.key === TAX_AMOUNT_KEY || m.key === CW20_TAX_AMOUNT_KEY)) {
      return feeApplyMapper(match)
    }

    return defaultMapper(match)
  })
}

function feeApplyMapper(match: Attributes): NonnativeTransferTransformed {
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
    if (m.key === FEE_AMOUNT_KEY || m.key === TAX_AMOUNT_KEY || m.key === CW20_TAX_AMOUNT_KEY || m.key === CW20_TAX_KEY) {
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