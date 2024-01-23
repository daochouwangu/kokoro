import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import OpenAI from 'openai'
const storage = new Storage()

export type RequestBody = {
  data: string
}
export type RequestResponse = string
const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  RequestResponse
> = async (req, res) => {
  const { data } = req.body
  const apiKey = await storage.get('openai-api-key')
  const baseURL = await storage.get('openai-base-url') || 'https://api.openai.com/v1'
  const openai = new OpenAI({ apiKey, baseURL })
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    messages: [
      { role: 'system', content: '你是一个负责总结技术博客内容的专家，请为下面这篇文章起一个20字以内的中文标题' },
      { role: 'user', content: data },
      { role: 'system', content: '标题是：' },
    ],
  })
  res.send(response.choices[0].message.content)
}

export default handler