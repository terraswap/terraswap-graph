export const factoryAddressMap: { [key: string]: string } = {
  columbus: "terra1jkndu9w5attpz09ut02sgey5dd3e8sq5watzm0",
  pisco: "terra1jha5avc92uerwp9qzx3flvwnyxs3zax2rrm6jkcedy2qvzwd2k7qk7yxcl",
  phoenix: "terra1466nf3zuxpya8q9emxukd7vftaf6h4psr0a07srl5zw74zh84yjqxl5qul",
};

export const baseCurrencyMap: { [key: string]: string } = {
  columbus: "uluna",
  pisco: "",
  phoenix: "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
}

const chainPrefix: string = process.env.TERRA_CHAIN_ID?.split("-")[0]
export const factoryAddress: string = process.env.TERRASWAP_FACTORY || factoryAddressMap[chainPrefix];
export const baseCurrency: string = baseCurrencyMap[chainPrefix];

export interface Asset {
  token?: {
    contract_addr: string
  }
  native_token?: {
    denom: string
  }
}

export interface Pair {
  asset_infos: Asset[]
  asset_decimals: [number, number]
  contract_addr: string
  liquidity_token: string
}
