import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function ApiResponseProperty(options: ApiPropertyOptions = {}) {
  return ApiProperty(Object.assign(options, { required: false, nullable: false }))
}
