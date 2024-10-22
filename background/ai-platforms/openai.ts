import OpenAI from "openai"

export async function callOpenAI(
  apiKey: string,
  baseURL: string,
  content: string
) {
  const openai = new OpenAI({ apiKey, baseURL })
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-1106",
    messages: [
      { role: "system", content: chrome.i18n.getMessage("prompt1") },
      { role: "user", content },
      { role: "system", content: chrome.i18n.getMessage("prompt2") }
    ],
    response_format: { type: "json_object" }
  })
  return response.choices[0].message.content
}
