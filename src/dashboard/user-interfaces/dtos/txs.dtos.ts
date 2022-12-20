import { IsEnum, IsOptional, IsString, Length } from 'class-validator'
import { TerraswapAction } from 'dashboard/services/dtos/dtos'
import { ApiResponseProperty } from '../decorators/api-property.decorator'

export class TxParam {
  @IsString()
  @Length(64, 64)
  txHash: string
}

export class TxsQuery {
  @IsOptional()
  @IsString()
  @Length(44, 64)
  pair: string

  @IsOptional()
  @IsEnum(TerraswapAction)
  action: TerraswapAction
}

export class TxResponse {
  @ApiResponseProperty({ example: '1923342' })
  id: number

  @ApiResponseProperty({ description: 'timestamp for the tx', example: '2021-11-10 09:41:02.774' })
  timestamp: number

  @ApiResponseProperty({
    description: 'the unique address of a tx',
    example: '50C8EF1224B17DA8025A1BBD534416C837A19FD88A1096A540997445F32F01DE',
  })
  txHash: string

  @ApiResponseProperty({ enum: TerraswapAction })
  action: TerraswapAction

  @ApiResponseProperty({ example: '-68287408' })
  token0Amount: string

  @ApiResponseProperty({ example: '14134' })
  token1Amount: string
}

export class TxsResponse {
  @ApiResponseProperty({ example: 256, deprecated: true })
  totalCount: number

  @ApiResponseProperty({ type: [TxResponse] })
  txs: TxResponse[]
}
