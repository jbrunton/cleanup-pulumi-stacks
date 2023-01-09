import {Logger} from '@usecases/check-legacy-stack'

export const assertLogs = (logger: Logger, expected: string[]) => {
  expected.forEach((expectedMessage, index) => {
    expect(logger.log).toHaveBeenNthCalledWith(index + 1, expectedMessage)
  })
  expect(logger.log).toHaveBeenCalledTimes(expected.length)
}

export const assertInfos = (logger: Logger, expected: string[]) => {
  expected.forEach((expectedMessage, index) => {
    expect(logger.info).toHaveBeenNthCalledWith(index + 1, expectedMessage)
  })
  expect(logger.info).toHaveBeenCalledTimes(expected.length)
}
