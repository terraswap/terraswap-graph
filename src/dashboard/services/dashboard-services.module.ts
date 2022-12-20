import { Module } from '@nestjs/common'
import { DashboardRepositoriesModule } from 'dashboard/repositories/dashboard-repositories.module'
import { DashboardPairsService } from './pairs.service'
import { DashboardTerraswapService } from './terraswap.service'
import { DashboardTxsService } from './txs.service'

@Module({
  imports: [DashboardRepositoriesModule],
  providers: [DashboardTerraswapService, DashboardPairsService, DashboardTxsService],
  exports: [DashboardTerraswapService, DashboardPairsService, DashboardTxsService],
})
export class DashboardServicesModule {}
