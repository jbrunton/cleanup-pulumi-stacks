import * as pulumi from '@pulumi/pulumi'
import {LocalWorkspace} from '@pulumi/pulumi/automation'

const workDir = '.'

const checkStacks = async () => {
  const testName = process.env.TEST_NAME
  pulumi.log.info(`Checking stacks for test [${testName}]`)

  const expectedStacks = process.env.EXPECTED_STACKS?.split(',')
    .filter(s => s.length)
    .sort()
  pulumi.log.info(`Expected stacks: [${expectedStacks}]`)

  const workspace = await LocalWorkspace.create({workDir})
  const allStacks = await workspace.listStacks()

  const testStackNames = [`${testName}-dev`, `${testName}-prod`]
  const testStacks = allStacks
    .map(stack => stack.name)
    .filter(stackName => testStackNames.includes(stackName))
    .sort()

  if (JSON.stringify(testStacks) === JSON.stringify(expectedStacks)) {
    pulumi.log.info(`Found expected stacks: [${expectedStacks}]`)
  } else {
    throw new Error(
      `Expected [${expectedStacks}] stacks but found [${testStacks}]`
    )
  }
}

checkStacks().catch(e => {
  pulumi.log.error(e)
  process.exit(1)
})
