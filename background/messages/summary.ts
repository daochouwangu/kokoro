import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type { Article } from "~popup"

import { call01AI } from "../ai-platforms/01ai"
import { callBytedance } from "../ai-platforms/bytedance"
import { callKimi } from "../ai-platforms/kimi"
import { callOpenAI } from "../ai-platforms/openai"

const storage = new Storage()

export type RequestBody = {
  title: string
  content: string
  url: string
}

export type RequestResponse = boolean

// 定义不同AI平台的API调用函数
const aiPlatformApis = {
  openai: callOpenAI,
  "01ai": call01AI,
  kimi: callKimi,
  bytedance: callBytedance
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const lang = chrome.i18n.getUILanguage()
  console.log(lang)
  const { title, content, url } = req.body
  if (!content) {
    res.send(false)
    return
  }

  const selectedPlatform = await storage.get("ai-platform")
  const apiKeys = await storage.get("ai-api-keys")
  const apiKey = apiKeys[selectedPlatform]
  const baseURL =
    (await storage.get("ai-base-url")) || "https://api.openai.com/v1"

  if (!apiKey) {
    res.send(null)
    return
  }

  try {
    let json
    if (selectedPlatform === "openai") {
      json = await aiPlatformApis[selectedPlatform](apiKey, baseURL, content)
    } else {
      json = await aiPlatformApis[selectedPlatform](apiKey, content)
    }

    let isChangeTitle = await storage.get<boolean>("is-change-title")
    if (isChangeTitle === undefined) {
      isChangeTitle = true
    }
    console.log(isChangeTitle)

    if (json) {
      if (!json.title) {
        json.title = title
      }
      const art = {
        title: isChangeTitle ? json.title : title,
        url,
        isAd: json.isAd,
        summary: json.summary
      }
      const data = (await storage.get<Article[]>("article-data")) || []
      data.push(art)
      storage.set("article-data", [...data])
      res.send(true)
    } else {
      res.send(false)
    }
  } catch (e) {
    console.error(e)
    res.send(false)
  }
}

export default handler
