import { Module } from '@nestjs/common'
import { DashboardServicesModule } from 'dashboard/services/dashboard-services.module'
import { PairsController } from './controllers/pairs.controller'
import { TerraswapController } from './controllers/terraswap.controller'
import { TxsController } from './controllers/txs.controller'

@Module({
  imports: [DashboardServicesModule],
  controllers: [TerraswapController, PairsController, TxsController],
})
export class DashboardUserInterfacesModule {}
