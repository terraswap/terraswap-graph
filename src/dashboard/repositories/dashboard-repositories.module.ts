import { Module } from '@nestjs/common'
import { DashboardPairsRepository } from './pairs.repository'
import { DashboardTerraswapRepository } from './terraswap.repository'
import { DashboardTxsRepository } from './txs.repository'

@Module({
  imports: [],
  providers: [DashboardTerraswapRepository, DashboardPairsRepository, DashboardTxsRepository],
  exports: [DashboardTerraswapRepository, DashboardPairsRepository, DashboardTxsRepository],
})
export class DashboardRepositoriesModule {}
