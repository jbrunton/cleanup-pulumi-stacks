import {Check} from './check'

export const UpdateCheck: Check = async stack => {
  const isLegacy = !stack.updateInProgress
  const description = `checked [updateInProgress=${stack.updateInProgress}]`
  return {
    isLegacy,
    description
  }
}
