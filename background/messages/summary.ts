import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import OpenAI from 'openai'
import type { Article } from "~popup"
const storage = new Storage()

export type RequestBody = {
  title: string,
  content: string,
  url: string
}
export type RequestResponse = boolean
const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const { 
    title,
    content,
    url,
  } = req.body
  if (!content) {
    res.send(false)
    return
  }
  const apiKey = await storage.get('openai-api-key')
  const baseURL = await storage.get('openai-base-url') || 'https://api.openai.com/v1'
  if (!apiKey) {
    res.send(null)
    return
  }
  const openai = new OpenAI({ apiKey, baseURL })
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106',
      messages: [
        { role: 'system', content: '你是一个负责总结技术博客内容的专家，请根据下面这篇文章返回一个json字符串，包含 { title, summary, isAd } 分别表示标题，总结，和是否可能是广告，标题在20字以内，总结在150字以内，isAd为 true 或者 false ' },
        { role: 'user', content },
        { role: 'system', content: '只返回json即可，返回结果：' },
      ],
      response_format: {"type": "json_object"}
    })
    if (!response.choices || !response.choices[0] || !response.choices[0].message || !response.choices[0].message.content) {
      res.send(null)
      return
    }
    // res.send(response.choices[0].message.content)
    const result = response.choices[0].message.content
    const json = JSON.parse(result || '{}')
    console.log(json)
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
      const data = await storage.get<Article[]>('article-data') || []
      data.push(art)
      storage.set('article-data', [...data])
      res.send(true)
    } else {
      res.send(false)
    }
  } catch (e) {
    console.log(e)
    res.send(false)
  }
}

export default handler