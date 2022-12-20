export interface volumesAndLiquidities {
  volume: string
  liquidityUst: string
  timestamp: Date
}

export interface pairEntity {
  pairAddress: string
  lpTokenAddress: string
  token0Reserve: string
  token1Reserve: string
  token0Address: string
  token1Address: string
  token0Symbol: string
  token1Symbol: string
  token0Decimals: string
  token1Decimals: string
}
