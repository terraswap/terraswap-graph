import { Module } from '@nestjs/common'
import { DashboardRepositoriesModule } from './repositories/dashboard-repositories.module'
import { DashboardServicesModule } from './services/dashboard-services.module'
import { DashboardUserInterfacesModule } from './user-interfaces/dashboard-user-interfaces.module'

@Module({
  imports: [DashboardRepositoriesModule, DashboardServicesModule, DashboardUserInterfacesModule],
})
export class DashboardsModule {}
