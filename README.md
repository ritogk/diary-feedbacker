# diary-feedbacker
臨床心理士のようなAIが日記から様々なフィードバックを送ってくれるアプリ

## 使い方
1. Notionで日記DBを作る
 <img src="https://github.com/ritogk/notion-diary-insight/assets/72111956/0b892689-ade3-419b-bbd1-ed54d420fc21" width="50%"/>
 
2. 日記を書く
<img src="https://github.com/ritogk/notion-diary-insight/assets/72111956/45469219-c0b5-4e99-9c17-628df305372b" width="50%" />

3. apiを実行
<img src="https://github.com/ritogk/notion-diary-insight/assets/72111956/de4032ce-3b60-475e-97d4-154d1d56baaa" width="50%" />

4. lineにフィードバックが届く
<img src="https://github.com/ritogk/notion-diary-insight/assets/72111956/12a1b394-540c-46a4-89ef-7d07a6bff5fe" width="50%" />



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
