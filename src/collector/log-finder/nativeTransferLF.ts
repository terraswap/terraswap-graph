import { createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { trimAssets } from 'lib/utils'
import { NativeTransferTransformed } from 'types'
import logRules from './log-rules'

export function createNativeTransferLogFinders(): ReturningLogFinderMapper<
  NativeTransferTransformed[]
> {
  return createReturningLogFinder(logRules.nativeTransferRule(), (_, match) => {
    let amountString = ''
    let sender = ''
    let recipient = ''

    match.forEach(m => {
      if (m.key === 'amount') {
        amountString = m.value
      }
      if (m.key === 'sender') {
        sender = m.value
      }
      if (m.key === 'recipient') {
        recipient = m.value
      }
    })

    if (!amountString) {
      return
    }

    const assetsInfo = trimAssets(amountString, true)
    return assetsInfo.map((asset) => {
      return {
        recipient,
        sender,
        assets: asset,
      }
    })
  })
}
