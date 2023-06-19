import { LogFinderRule } from '@terra-money/log-finder'
import { COLUMBUS_5_COSMWASM_UPDATE_HEIGHT } from 'lib/terra/consts'


function phoenixCreatePairRule(factoryAddress: string, _height?: number): LogFinderRule {
  return {
    type: 'wasm',
    attributes: [
      ['_contract_address', factoryAddress],
      ['action', 'create_pair'],
      ['pair'],
      ['_contract_address'],
      ['liquidity_token_addr'],
    ],
  }
}

// swap, provide and withdraw rule
function phoenixSPWRule(_height?: number): LogFinderRule {
  return {
    type: 'wasm',
    attributes: [
      ['_contract_address'],
      [
        'action',
        (value) => value === 'swap' || value === 'provide_liquidity' || value === 'withdraw_liquidity',
      ],
    ],
    matchUntil: '_contract_address',
  }
}

function phoenixNonnativeTransferRule(_height?: number): LogFinderRule {
  return {
    type: 'wasm',
    attributes: [
      ['_contract_address'],
      [
        'action',
        (value) =>
          value === 'transfer' ||
          value === 'send' ||
          value === 'transfer_from' ||
          value === 'send_from',
      ],
    ],
    matchUntil: '_contract_address',
  }
}

function phoenixSortedNativeTransferRule(_height?: number): LogFinderRule {
  return {
    type: 'transfer',
    attributes: [['amount'], ['recipient'], ['sender']],
  }
}

const phoenix = {
  createPairRule: phoenixCreatePairRule,
  spwRule: phoenixSPWRule,
  nonnativeTransferRule: phoenixNonnativeTransferRule,
  nativeTransferRule: phoenixSortedNativeTransferRule,
}


function col5CreatePairRule(factoryAddress: string, height?: number): LogFinderRule {
  if (height < COLUMBUS_5_COSMWASM_UPDATE_HEIGHT) {
    return {
      type: 'wasm',
      attributes: [
        ['contract_address', factoryAddress],
        ['action', 'create_pair'],
        ['pair'],
        ['contract_address'],
        ['liquidity_token_addr'],
      ],
    }
  }

  return {
    type: 'wasm',
    attributes: [
      ['_contract_address', factoryAddress],
      ['action', 'create_pair'],
      ['pair'],
      ['_contract_address'],
      ['liquidity_token_addr'],
    ],
  }
}

// swap, provide and withdraw rule
function col5CreatePairRuleSPWRule(height?: number): LogFinderRule {
  if (height < COLUMBUS_5_COSMWASM_UPDATE_HEIGHT) {
    return {
      type: 'wasm',
      attributes: [
        ['contract_address'],
        [
          'action',
          (value) => value === 'swap' || value === 'provide_liquidity' || value === 'withdraw_liquidity',
        ],
      ],
      matchUntil: 'contract_address',
    }
  }
  return {
    type: 'wasm',
    attributes: [
      ['_contract_address'],
      [
        'action',
        (value) => value === 'swap' || value === 'provide_liquidity' || value === 'withdraw_liquidity',
      ],
    ],
    matchUntil: '_contract_address',
  }
}

function col5NonnativeTransferRule(height?: number): LogFinderRule {
  if (height < COLUMBUS_5_COSMWASM_UPDATE_HEIGHT) {
    return {
      type: 'wasm',
      attributes: [
        ['contract_address'],
        [
          'action',
          (value) =>
            value === 'transfer' ||
            value === 'send' ||
            value === 'transfer_from' ||
            value === 'send_from',
        ],
      ],
      matchUntil: 'contract_address',
    }
  }

  return {
    type: 'wasm',
    attributes: [
      ['_contract_address'],
      [
        'action',
        (value) =>
          value === 'transfer' ||
          value === 'send' ||
          value === 'transfer_from' ||
          value === 'send_from',
      ],
    ],
    matchUntil: '_contract_address',
  }
}

function col5SortedNativeTransferRule(_height?: number): LogFinderRule {
  return {
    type: 'transfer',
    attributes: [['amount'], ['recipient'], ['sender']],
  }
}

const classic = {
  createPairRule: col5CreatePairRule,
  spwRule: col5CreatePairRuleSPWRule,
  nonnativeTransferRule: col5NonnativeTransferRule,
  nativeTransferRule: col5SortedNativeTransferRule,
}


export function col4CreatePairRule(factoryAddress: string, _height?: number): LogFinderRule {
  return {
    type: 'from_contract',
    attributes: [
      ['contract_address', factoryAddress],
      ['action', 'create_pair'],
      ['pair'],
      ['contract_address'],
      ['liquidity_token_addr'],
    ],
  }
}

// swap, provide and withdraw rule
export function col4SpwRule(_height?: number): LogFinderRule {
  return {
    type: 'from_contract',
    attributes: [
      ['contract_address'],
      [
        'action',
        (value) => value == 'swap' || value == 'provide_liquidity' || value == 'withdraw_liquidity',
      ],
    ],
    matchUntil: 'contract_address',
  }
}

export function col4NonnativeTransferRule(_height?: number): LogFinderRule {
  return {
    type: 'from_contract',
    attributes: [
      ['contract_address'],
      [
        'action',
        (value) =>
          value == 'transfer' ||
          value == 'send' ||
          value == 'transfer_from' ||
          value == 'send_from',
      ],
    ],
    matchUntil: 'contract_address',
  }
}


export function col4SortedNativeTransferRule(_height?: number): LogFinderRule {
  return {
    type: 'transfer',
    attributes: [['amount'], ['recipient'], ['sender']],
  }
}


const columbus4 = {
  createPairRule: col4CreatePairRule,
  spwRule: col4SpwRule,
  nonnativeTransferRule: col4NonnativeTransferRule,
  nativeTransferRule: col4SortedNativeTransferRule,
}

const target = process.env.TERRA_CHAIN_ID?.includes("phoenix") ? phoenix : process.env.TERRA_CHAIN_ID?.includes("columbus-4") ? columbus4 : classic

export default {
  createPairRule: target.createPairRule,
  spwRule: target.spwRule,
  nonnativeTransferRule: target.nonnativeTransferRule,
  nativeTransferRule: target.nativeTransferRule,
  isParsable: (type: string): boolean => {
    return (type === 'transfer') || (process.env.TERRA_CHAIN_ID?.includes("columbus-4") ? type === 'from_contract' : type === 'wasm')
  }
}