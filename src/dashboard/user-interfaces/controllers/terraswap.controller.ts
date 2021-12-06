import { Get, Query } from '@nestjs/common'
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { MAXIMUM_DATE_RANGE } from 'dashboard/services/common/defined'
import { QueryUnit } from 'dashboard/services/dtos/dtos'

import { DashboardTerraswapService } from 'dashboard/services/terraswap.service'
import {
  TerraswapDataResponse,
  TerraswapDataResponses,
  TerraswapQuery,
  TerraswapRecentDataResponse,
} from 'dashboard/user-interfaces/dtos/terraswap.dtos'
import { MyController } from '../decorators/controller.decorator'

@MyController('terraswap')
@ApiTags('dashboard')
export class TerraswapController {
  constructor(private readonly service: DashboardTerraswapService) {}

  @Get()
  @ApiQuery({ name: 'from', example: '2021-11-01', required: false })
  @ApiQuery({ name: 'to', example: '2021-11-15', required: false })
  @ApiQuery({ name: `unit`, enum: QueryUnit, required: false })
  @ApiResponse({ type: [TerraswapDataResponse] })
  async getData(@Query() range: TerraswapQuery): Promise<TerraswapDataResponses> {
    const to = range.to ? range.to : new Date()
    let from = range.from
    if (!from || from > to || to.valueOf() - from.valueOf() > MAXIMUM_DATE_RANGE) {
      from = new Date(to.valueOf() - MAXIMUM_DATE_RANGE)
    }
    return await this.service.getTerraswapData(from, to)
  }

  @Get('/recent')
  @ApiResponse({ type: TerraswapRecentDataResponse })
  async getRecentData(): Promise<TerraswapRecentDataResponse> {
    return await this.service.getTerraswapRecentData()
  }
}
