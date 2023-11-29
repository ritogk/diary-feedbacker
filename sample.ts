import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager"

// AWS SDK のクライアントを初期化
const client = new SecretsManagerClient({ region: "ap-northeast-1" })

async function getSecretValue(secretName: string): Promise<string> {
  const command = new GetSecretValueCommand({ SecretId: secretName })
  try {
    const response = await client.send(command)
    return response.SecretString ?? ""
  } catch (error) {
    console.error("Error fetching secret", error)
    throw error
  }
}

// 使用例
const secretName = "lambda-secret"
getSecretValue(secretName).then((value) => {
  console.log("Secret Value:", value)
})
