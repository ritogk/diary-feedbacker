import * as cdk from "aws-cdk-lib"
import * as acm from "aws-cdk-lib/aws-certificatemanager"
import * as apig from "aws-cdk-lib/aws-apigateway"
import * as route53 from "aws-cdk-lib/aws-route53"
import * as route53Targets from "aws-cdk-lib/aws-route53-targets"
import { Construct } from "constructs"
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Runtime, Architecture } from "aws-cdk-lib/aws-lambda"
import * as path from "path"
import * as dotenv from "dotenv"

export class DiaryFeedBuckerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    dotenv.config({ path: "./cdk.env" })
    const hostedZoneId = process.env.HOST_ZONE_ID ?? ""
    const subDomain = process.env.SUB_DOMAIN ?? ""
    const domain = process.env.DOMAIN ?? ""

    const lambdaFunction = new NodejsFunction(this, "diaryFeedBuckerLambda", {
      entry: "lib/lambda/index.ts",
      runtime: Runtime.NODEJS_18_X,
      architecture: Architecture.ARM_64,
      handler: "handler",
      timeout: cdk.Duration.seconds(60),
      // GUIから環境変数を設定する
      // MODE: "prod"
      // NOTION_SECRET: "xxxxxxxx",
      // NOTION_DIARY_DATABASE_ID: "xxxxxxxx",
      // LINE_CHANNEL_ACCESS_TOKEN: "xxxxxxxx",
      // OPENAI_API_KEY: "xxxxxxxx",
    })

    // lambdaにssmのparameter store(/lien/user-id)を読み込むように権限を付与
    lambdaFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: ["ssm:GetParameter"],
        resources: ["*"],
      })
    )

    // JavaScriptファイルからLambda関数を作成
    const authroizerLambda = new cdk.aws_lambda.Function(
      this,
      "AuthorizerDiaryFeedBuckerLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index-authorizer.handler", // JavaScriptファイルのハンドラ関数
        code: cdk.aws_lambda.Code.fromAsset(
          path.join(__dirname, "/lambda/authorizer")
        ),
      }
    )

    // ApiGateawyの作成
    const api = new apig.RestApi(this, "RestApi", {
      restApiName: "diary-feedbacker",
      endpointTypes: [apig.EndpointType.REGIONAL],
      description: "日記のフィードバッカーAPI",
      apiKeySourceType: apig.ApiKeySourceType.AUTHORIZER,
      deployOptions: {
        stageName: "prod",
      },
      // cdk更新のたびにステージングにデプロイする
      deploy: true,
    })

    // ルートとlambdaを設定
    // ルートへのリクエストをlambdaオーソライザーで認可制御する
    const resource = api.root.addMethod(
      "GET",
      new apig.LambdaIntegration(lambdaFunction, {
        proxy: false,
        integrationResponses: [
          {
            statusCode: "202",
            responseTemplates: {
              "application/json": '{"message": "processing..."}',
            },
          },
        ],
        requestTemplates: {
          "application/json": JSON.stringify({
            goal: "$input.params('goal')",
          }),
        },
        // api-gatewayからlambdaをバックグラウンドで実行する
        requestParameters: {
          "integration.request.header.X-Amz-Invocation-Type": "'Event'",
        },
      }),
      {
        methodResponses: [{ statusCode: "202" }],
        authorizationType: apig.AuthorizationType.CUSTOM,
        // lambdaオーソライザーを設定
        authorizer: new apig.RequestAuthorizer(this, "Authorizer", {
          authorizerName: "diary-feedbacker-authorizer",
          handler: authroizerLambda,
          identitySources: [apig.IdentitySource.queryString("apiKey")],
        }),
        apiKeyRequired: true,
        // クエリパラメータにapiKeyを必須にする
        requestParameters: {
          "method.request.querystring.apiKey": true,
          "method.request.querystring.goal": true,
        },
      }
    )

    // apiキー作成
    const apiKey = api.addApiKey("diary-feedbacker-api-key")
    // 使用量プランを作成
    const plan = api.addUsagePlan("UsagePlan", {
      name: "diary-feedbacker-usage-plan",
    })
    // 使用量プランにステージを紐付け
    plan.addApiStage({
      stage: api.deploymentStage,
    })
    // 使用量プランにapiキーを紐付け
    plan.addApiKey(apiKey)

    // ホストゾーンを取得
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(
      this,
      "GetHostZone",
      {
        hostedZoneId: hostedZoneId,
        zoneName: domain,
      }
    )

    // サブドメインのacm証明書を作成
    const certificate = new acm.Certificate(this, "CreateCertificate", {
      domainName: subDomain,
      validation: acm.CertificateValidation.fromDns(hostedZone), // DNS検証を使用
    })

    // ApiGatewayにSSL証明書付きのカスタムドメインを設定
    api.addDomainName("CustomDomain", {
      domainName: subDomain,
      certificate: certificate,
    })

    // サブドメインとapi-gatewayを紐付ける
    new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      recordName: subDomain,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.ApiGateway(api)
      ),
    })
  }
}
