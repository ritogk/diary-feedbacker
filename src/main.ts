const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
dotenv.config()
const notionToken = process.env.NOTION_TOKEN ?? ""
const databaseId = process.env.NOTION_DATABASE_ID ?? ""

// Initializing a client
const notion = new Client({
  auth: notionToken,
})

const getPage = async () => {
  // データベースの日付が2023-11/14のものを取得する
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Date",
      date: {
        equals: "2023-11-15",
      },
    },
  })
  const pages = response.results
  if (pages.length > 0) {
    const page = pages[0]
    // ページid: fce17b53144b42159fd7c536fb390199内に含まれるブロックの内容を出力する
    const response = await notion.blocks.children.list({
      block_id: page.id,
    })
    // テキストのみ出力する
    response.results.forEach((block: any) => {
      if (block.type === "paragraph" && block.paragraph.rich_text.length > 0) {
        console.log(block.paragraph.rich_text[0].plain_text)
      }
    })

    // pageのmentalプロパティに値を書き込む
    const response2 = await notion.pages.update({
      page_id: page.id,
      properties: {
        mental: {
          number: 5,
        },
      },
    })
  }
}

getPage()
