import { applyDecorators, Controller } from '@nestjs/common'
import { ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function MyController(prefix?: string) {
  return applyDecorators(
    ApiNotFoundResponse({ description: 'Not found' }),
    ApiBadRequestResponse({ description: 'Bad Request' }),
    Controller(prefix)
  )
}
