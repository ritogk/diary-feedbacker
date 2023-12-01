# notion-diary-Insight
Notionの日記からフィードバックを返してくれるアプリ

## 設定
```
npm install
```

## ts-nodeを使ったローカルでの動作確認
```
cp lib/lambda/core/env/local.base.env lib/lambda/core/env/local.env
vim lib/lambda/core/env/local.env
npx ts-node lib/lambda/run.ts
```

## AWSにデプロイして動作する所まで
```
cp cdk.base.env cdk.env
vim cdk.env
cdk deploy
```
1. マネジメントコンソールを開き、生成されたlambda関数の環境変数を設定する  
```
// MODE: "prod"
// NOTION_SECRET: "xxxxxxxx",
// NOTION_DIARY_DATABASE_ID: "xxxxxxxx",
// LINE_CHANNEL_ACCESS_TOKEN: "xxxxxxxx",
// OPENAI_API_KEY: "xxxxxxxx",
```
2. マネジメントコンソールからAPiGatewayのAPIキーをコピー  
3. クエリパラメーターにapiKeyをつけてリクエストを送る
```
curl -X GET "https://xxxxx.xxxxxx.net?apiKey=xxxxxxxxx"
```
