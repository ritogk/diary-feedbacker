import { handler } from "./lambda/main"

// ts-nodeから実行するためのファイル
const run = async () => {
  await handler()
}
run()
