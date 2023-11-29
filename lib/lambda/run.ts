import { handler } from "./handler"

// ts-nodeから実行するためのファイル
const run = async () => {
  await handler()
}
run()
