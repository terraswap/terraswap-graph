import { createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import logRules from './log-rules'

export function createCreatePairLogFinders(
  factoryAddress: string,
  height?: number
): ReturningLogFinderMapper<{ assets: string[]; pairAddress: string; lpTokenAddress: string }> {
  return createReturningLogFinder(logRules.createPairRule(factoryAddress, height), (_, match) => {
    return {
      assets: match[2].value.split('-'),
      pairAddress: match[3].value,
      lpTokenAddress: match[4].value,
    }
  })
}
