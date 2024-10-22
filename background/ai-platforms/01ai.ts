import { Storage } from "@plasmohq/storage"

export async function call01AI(apiKey: string, content: string) {
  const url = "https://api.lingyiwanwu.com/v1/chat/completions"
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`
  }
  const body = JSON.stringify({
    model: "yi-lightning",
    messages: [
      { role: "system", content: chrome.i18n.getMessage("prompt1") },
      { role: "user", content },
      { role: "system", content: chrome.i18n.getMessage("prompt2") }
    ],
    temperature: 0.3,
    max_tokens: 5000
  })

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      )
      throw new Error(`01万物 API 调用失败: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    // 提取content字符串
    let contentString = data.choices[0].message.content
    console.log(contentString)
    //     ```json
    // {
    //   "title": "GAGAvatar实现单图3D头像重建与实时重现",
    //   "summary": "GAGAvatar是一种可泛化和可动画化的3D高斯头像方法，可以从单张图片重建3D头像，并在实时重现中实现高保真效果。传统方法依赖神经辐射场，导致渲染耗时且重现速度慢。我们通过单次前向传播生成3D高斯参数，利用双重提升方法捕捉身份和面部细节，并使用全局图像特征和3D可变形模型控制表情。实验表明，我们的方法在重建质量和表情准确性方面优于现有方法，并为未来的数字头像应用和研究设定了新基准。",
    //   "isAd": false
    // }
    // ```

    // 尝试解析JSON
    let contentJson
    try {
      contentString = contentString.replace(/```json\s*|```/g, "")
      contentJson = JSON.parse(contentString)
      console.log(contentJson)

      // 使用 @plasmohq/storage 来存储大型对象
      const storage = new Storage()
      await storage.set("lastResponse", JSON.stringify(contentJson))
    } catch (jsonError) {
      console.error("JSON解析失败，返回原始内容:", contentString)
      return contentString
    }
    return contentJson
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("01万物 API 调用超时")
      throw new Error("01万物 API 调用超时")
    } else {
      console.error("01万物 API 调用错误:", error)
      throw new Error(`01万物 API 调用失败: ${error.message}`)
    }
  }
}
