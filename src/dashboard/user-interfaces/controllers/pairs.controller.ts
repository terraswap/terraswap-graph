import { Get, Param } from '@nestjs/common'
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'
import { DashboardPairsService } from 'dashboard/services/pairs.service'
import { DashboardController } from '../decorators/controller.decorator'
import {
  PairRecentDataResponse,
  PairResponse,
  PairsParam,
  PairsResponse,
  PairsResponses,
} from '../dtos/pairs.dtos'

@DashboardController('pairs')
@ApiTags('dashboard')
export class PairsController {
  constructor(private readonly service: DashboardPairsService) { }

  @Get()
  @ApiResponse({ type: [PairsResponse] })
  async getPairs(): Promise<PairsResponses> {
    const dtos = await this.service.getPairs()
    return dtos.map((dto) => {
      return {
        ...dto,
        pairAlias: `${dto.token0Symbol}-${dto.token1Symbol}`,
      }
    })
  }

  @Get('/:pairAddress/recent')
  @ApiParam({ name: 'pairAddress', example: 'terra1a5cc08jt5knh0yx64pg6dtym4c4l8t63rhlag3' })
  @ApiResponse({ type: PairRecentDataResponse })
  async getRecentDataOfPair(@Param() dto: PairsParam): Promise<PairRecentDataResponse> {
    return await this.service.getRecentData(dto.pairAddress)
  }

  @Get('/:address')
  @ApiParam({ name: 'address', example: 'terra1a5cc08jt5knh0yx64pg6dtym4c4l8t63rhlag3' })
  @ApiResponse({ type: PairResponse })
  async getPair(@Param('address') addr: string): Promise<PairResponse> {
    const dtos = await this.service.getPair(addr)
    dtos.volume24h.token0Volume = dtos.volume24h.token0Volume || '0'
    dtos.volume24h.token1Volume = dtos.volume24h.token1Volume || '0'
    dtos.volume24h.volumeUST = dtos.volume24h.volumeUST || '0'
    dtos.token0.price = dtos.token0.price || '0'
    dtos.token1.price = dtos.token1.price || '0'
    return dtos
  }
}
