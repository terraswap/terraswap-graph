import { TokenDto, Volume24hDto } from 'dashboard/services/dtos/dtos'
import { ApiResponseProperty } from '../decorators/api-property.decorator'

export class TokenResponse extends TokenDto {
  @ApiResponseProperty({ example: 'terra1r5506ckw5tfr3z52jwlek8vg9sn3yflrqrzfsc' })
  tokenAddress: string

  @ApiResponseProperty({ example: 'TLAND' })
  symbol: string

  @ApiResponseProperty({ description: 'price in UST', example: '56.2004967231' })
  price?: string
}

export class Volume24hResponse extends Volume24hDto {
  @ApiResponseProperty({ description: "Token 0's daily volume", example: '1020000000' })
  token0Volume: string

  @ApiResponseProperty({ description: "Token 1's daily volume", example: '984621790098' })
  token1Volume: string

  @ApiResponseProperty({ example: '1020000000' })
  volumeUST: string
}
