import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda"
import * as path from "path"

export class DiaryFeedBuckerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const lambdaFunction = new NodejsFunction(this, "sampleFunction", {
      entry: "lib/lambda/main.ts",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      handler: "handler",
    })
  }
}
