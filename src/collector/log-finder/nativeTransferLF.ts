import { createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { trimAssets } from 'lib/utils'
import { NativeTransferTransformed } from 'types'
import logRules from './log-rules'

export function createNativeTransferLogFinders(): ReturningLogFinderMapper<
  NativeTransferTransformed[]
> {
  return createReturningLogFinder(logRules.nativeTransferRule(), (_, match) => {
    if (!match[2].value) {
      return
    }
    const assetsInfo = trimAssets(match[2].value, true)
    return assetsInfo.map((asset) => {
      return {
        recipient: match[0].value,
        sender: match[1].value,
        assets: asset,
      }
    })
  })
}
