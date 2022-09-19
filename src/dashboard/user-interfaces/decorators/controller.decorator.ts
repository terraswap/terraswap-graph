import { applyDecorators, Controller } from '@nestjs/common'
import { ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function DashboardController(prefix?: string) {
  prefix = prefix.indexOf("/") === 0 ? prefix.slice(1) : prefix

  return applyDecorators(
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiBadRequestResponse({ description: 'Bad Request' }),
    Controller(`dashboard/${prefix}`)
  )
}
