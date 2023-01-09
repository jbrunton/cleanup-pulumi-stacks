import * as core from '@actions/core'
import {Logger} from '@entities/lib'

type CreateLoggerParams = {
  preview: boolean
  verbose: boolean
}

export const createLogger = ({
  preview,
  verbose
}: CreateLoggerParams): Logger => ({
  info: preview
    ? (message: string) => core.info(`[PREVIEW] ${message}`)
    : core.info,
  log: verbose ? core.info : () => {}
})
