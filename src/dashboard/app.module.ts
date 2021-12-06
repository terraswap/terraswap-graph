import { Module } from '@nestjs/common'
import { DashboardsModule } from './dashboards.module'

@Module({
  imports: [DashboardsModule],
})
export class AppModule {}
