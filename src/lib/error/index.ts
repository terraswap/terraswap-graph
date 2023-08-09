import * as sentry from '@sentry/node'
import * as logger from 'lib/logger'
import { ParamsError } from '.'
import { AxiosError } from 'axios'

export function init(
  opts: {
    sentryDsn?: string
  } = undefined
): void {
  opts?.sentryDsn &&
    sentry.init({
      dsn: opts.sentryDsn,
      environment: process.env.TERRA_CHAIN_ID,
      maxBreadcrumbs: 500,
    })

  process.on('unhandledRejection', (error) => {
    logger.error(error)

    sentry.withScope((scope) => {
      scope.setLevel(sentry.Severity.Critical)
      sentry.captureException(error)
    })
  })
}

export function errorHandlerWithSentry(err?: AxiosError | Error): void {
  if (err) {
    logger.error(err)

    // avoid sentry error for 404
    if ("isAxiosError" in err && err.response?.status === 404) {
      return
    }

    // do not send Params Error to sentry
    if (!(err instanceof ParamsError)) {
      sentry.captureException(err)
    }
  }
}

export function errorHandler(error?: Error): void {
  if (error) {
    logger.error(error)
  }
}

export * from './api'
export * from './params'
