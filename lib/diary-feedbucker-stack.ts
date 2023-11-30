import * as cdk from "aws-cdk-lib"
import { Construct } from "constructs"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda"

export class DiaryFeedBuckerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const lambdaFunction = new NodejsFunction(this, "sampleFunction", {
      entry: "lib/lambda/index.ts",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      handler: "handler",
      timeout: cdk.Duration.seconds(60),
      // GUIから環境変数を設定する
      // NOTION_SECRET: "xxxxxxxx",
      // NOTION_DIARY_DATABASE_ID: "xxxxxxxx",
      // LINE_CHANNEL_ACCESS_TOKEN: "xxxxxxxx",
      // OPENAI_API_KEY: "xxxxxxxx",
    })

    // lambdaにssmのparameter storeの全リソースの読み取り権限を付与する
    lambdaFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: ["*"],
      })
    )
  }
}
