import { Attribute, createReturningLogFinder, ReturningLogFinderMapper } from '@terra-money/log-finder'
import { trimAssets, addMinus } from 'lib/utils'
import { TxHistoryTransformed } from 'types'
import logRules from './log-rules'

type asset = {token: string; amount: string}

enum SwapMessageKey {
  contractAddress = '_contract_address',
  action = 'action',
  sender = 'sender',
  receiver = 'receiver',
  offerAsset = 'offer_asset',
  askAsset = 'ask_asset',
  offerAmount = 'offer_amount',
  returnAmount = 'return_amount',
  spreadAmount = 'spread_amount',
  commissionAmount = 'commission_amount',
}
enum ProvideMessageKey {
  contractAddress= '_contract_address',
  action= 'action',
  sender= 'sender',
  receiver= 'receiver',
  assets= 'assets',
  share= 'share'
}

enum WithdrawMessageKey {
contractAddress = '_contract_address'	,
action = 'action'	,
refundAssets = 'refund_assets',
sender = 'sender'	,
withdrawnShare = 'withdrawn_share'	

}
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
        assets = swapMatchToAssets(match)
      } else if (action === 'provide_liquidity') {
        const assetMsg = match.find((m) => m.key === ProvideMessageKey.assets)
        if (assetMsg){
          assets = trimAssets(assetMsg.value, true)
        }
        share = matchesToShare(match, ProvideMessageKey.share)
      } else if (action === 'withdraw_liquidity') {
        const assetMsg = match.find((m) => m.key === WithdrawMessageKey.refundAssets)
        if (assetMsg){
          assets = trimAssets(assetMsg.value, true)
        }
        share = matchesToShare(match, WithdrawMessageKey.withdrawnShare)
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

function swapMatchToAssets(matches: Attribute[]): asset[] {
  const assets: asset[] = [
    {
      token: '',
      amount: '',
    },
    {
      token: '',
      amount: '',
    },
  ]

  matches.forEach((match) => {
    if (match.key === SwapMessageKey.offerAsset) {
      assets[0].token = match.value
    }
    if (match.key === SwapMessageKey.offerAmount) {
      assets[0].amount = match.value
    }
    if (match.key === SwapMessageKey.askAsset) {
      assets[1].token = match.value
    }
    if (match.key === SwapMessageKey.returnAmount) {
      assets[1].amount = "-" + match.value
    }
  })

  return assets
}

function matchesToShare(matched: Attribute[],  targetKey: string): string {
  let share = '0'
  matched.forEach((match) => {
    if (match.key === targetKey) {
      share = match.value
    }
  })

  return share
}

export const createSPWFinder = process.env.TERRA_CHAIN_ID === "columbus-4" ? createLegacySPWFinder : createNewSPWFinder
