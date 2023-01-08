import * as core from '@actions/core'
import {Logger} from '@usecases/get-legacy-stacks'

export type LoggerParams = {
  preview: boolean
  verbose: boolean
}

export const createLogger = ({preview, verbose}: LoggerParams): Logger => ({
  info: preview
    ? (message: string) => core.info(`[PREVIEW] ${message}`)
    : core.info,
  log: verbose ? core.info : () => {}
})
