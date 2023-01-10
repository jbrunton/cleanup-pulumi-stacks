import * as pulumi from '@pulumi/pulumi'
import * as pulumiservice from '@pulumi/pulumiservice'
import * as aws from '@pulumi/aws'

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket('my-bucket')

// Export the name of the bucket
export const bucketName = bucket.id

new pulumiservice.StackTag('stack-tags', {
  organization: pulumi.getOrganization(),
  project: pulumi.getProject(),
  stack: pulumi.getStack(),
  name: 'environment',
  value: process.env.ENVIRONMENT_TAG
})
