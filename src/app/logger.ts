import * as core from '@actions/core'
import {Logger} from '../usecases/get-legacy-stacks'

export const createLogger = (preview: boolean): Logger => ({
  info: preview
    ? (message: string) => core.info(`[PREVIEW] ${message}`)
    : () => {},
  preview: preview ? core.info : () => {}
})
