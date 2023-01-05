export type CheckResult = {
  isLegacy: boolean
  description: string
}

interface Check {
  (): CheckResult
}
