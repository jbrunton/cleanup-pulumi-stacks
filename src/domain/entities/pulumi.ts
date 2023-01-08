export interface Stack {
  name: string
  lastUpdate?: Date
  updateInProgress: boolean
  resourceCount?: number
  getTag(name: string): Promise<string | null>
}
