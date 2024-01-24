import "./style.css"
import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Readability } from "@mozilla/readability"
import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react";
export interface Article {
  title: string;
  url: string;
  isAd?: boolean;
  summary?: string;
}
function IndexPopup() {
  const [data, setData] = useStorage<Article[]>("article-data", [])
  const [isLoading, setIsLoading] = useState(false)
  const [showSummary, setShowSummary] = useState(-1)
  const [useAI, setUseAI] = useStorage<boolean>("use-ai", false)
  const [apikey] = useStorage<string>("openai-api-key")
  const set = new Set(data.map(item => item.url))
  const clear = () => {
    setData([])
  }
  const getArticle = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tab[0];
    const url = currentTab.url;
    if (set.has(url)) {
      alert('已经添加过了')
      setIsLoading(false)
      return
    }
    const res = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: () => {
        const article = document.querySelector('article')
        if (article) {
          return article.parentElement.outerHTML
        }
        const html = document.documentElement.innerHTML
        return html
      }
    })
    const html = res[0]?.result
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const article = new Readability(doc).parse();
    // 去除文章中的多余空格(连续俩个空格及以上)和换行
    let content = article.textContent.replace(/\n/g, ' ').replace(/(\s{2,})/g, ' ')
    // remove link
    content = content.replace(/(https?:\/\/[^\s]+)/g, '')
    return {
      url,
      article,
      content
    }
  }
  const addWithAi = async () => {
    setIsLoading(true)
    const {
      url,
      article,
      content
    } = await getArticle()
    let title = ''
    if (!useAI || !content || content.length < 30) {
      title = article.title
    } else {
      const result = await sendToBackground({
        name: 'summary',
        body: {
          title: article.title,
          url,
          content
        },
      })
      if (result) {
        setIsLoading(false)
        return
      }
    }
    if (title) {
      // get current tab link
      const article = {
        title,
        url,
      }
      setData([...data, article])
    }
    setIsLoading(false)
  }
  const addWithOutAi = async() => {
    setIsLoading(true)
    const {
      url,
      article,
      content
    } = await getArticle()
    let title = article.title
    if (title) {
      // get current tab link
      const article = {
        title,
        url,
      }
      setData([...data, article])
    }
    setIsLoading(false)
  }
  // copy with markdown
  const copy = () => {
    const text = data.map(item => `- [${item.title}](${item.url})`).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      alert('复制成功')
    })
  }
  const deleteItem = (index: number) => {
    const newData = data.filter((item, i) => i !== index)
    setData(newData)
  }
  const toOption = () => {
    chrome.runtime.openOptionsPage()
  }
  return (
    <div
      className="flex flex-col p-4 pt-1 w-96">
        <div className="flex flex-row h-6 justify-between p-2">
          <div className="flex h-6 items-center">
            <input
              id="offers"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              name="offers"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="offers" className="text-xl text-gray-900">
              AI
            </label>
            {
              useAI && !apikey && (
                <div className="text-red-500 text-sm underline cursor-pointer" onClick={() => toOption()}>请先设置 OpenAI 秘钥</div>
              )
            }
          </div>
          <div className="text-blue-500 text-sm underline cursor-pointer" onClick={() => toOption()}>设置</div>
        </div>
        <div className="flex flex-col p-2 gap-1 mt-1">
          {
            data.map((item, index) => {
              return (
                <div key={index} className="flex flex-col items-between border shadow rounded bg-slate-200 text-base font-bold p-2">
                  <div className="flex flex-row w-full justify-between">
                    <a href={item.url} target="_blank">{item.title}</a>
                    <div className="flex flex-row flex-nowrap">
                      { item.summary ? <button className="bg-blue-500 w-6 h-6 text-white px-1" onClick={() => showSummary === index ? (setShowSummary(-1)) : setShowSummary(index)}>📖</button> : null}
                      { item.isAd ? <div className="bg-green-500 w-6 h-6 text-white px-1 inline-block" >Ad</div>: null }
                      <button className="bg-red-500 text-white px-1 w-6 h-6" onClick={() => deleteItem(index)}>X</button></div>
                    </div>
                  {
                    showSummary === index ? (
                      <article className=" text-sm font-normal text-gray-500">
                        {item.summary}
                      </article>
                    ) : null
                  }
                </div>
              )
            })
          }
          {
            isLoading && <div className="flex flex-row justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900">
              </div>
            </div>
          }
        </div>
      <div className="flex flex-row items-center p-2">
        {
          useAI ? <button className="border rounded text-lg bg-yellow-400 text-white w-64" onClick={addWithAi}>总结并添加</button>
          :<button className="border rounded text-lg bg-purple-500 text-white w-64" onClick={addWithOutAi}>添加</button>
        }
        <button className="border rounded text-lg bg-blue-400 text-white w-64" onClick={copy}>复制</button>
      </div>
    </div>
  )
}

export default IndexPopup