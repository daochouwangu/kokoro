import "./style.css"
import { sendToBackground, sendToContentScript } from "@plasmohq/messaging"
import { Readability } from "@mozilla/readability"
import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react";
interface Article {
  title: string;
  url: string;
}
function IndexPopup() {
  const [data, setData] = useStorage<Article[]>("article-data", [])
  const [isLoading, setIsLoading] = useState(false)
  
  const set = new Set(data.map(item => item.url))
  const clear = () => {
    setData([])
  }
  const handleClick = async () => {
    const tab = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tab[0];
    const url = currentTab.url;
    if (set.has(url)) {
      alert('已经添加过了')
      return
    }
    setIsLoading(true)
    const res = await sendToContentScript({
      name: 'getPageHtml',
    }).catch(err => console.error(err))
    const parser = new DOMParser();
    const doc = parser.parseFromString(res, "text/html");
    const article = new Readability(doc).parse();
    // 去除文章中的多余空格(连续俩个空格及以上)和换行

    let content = article.textContent.replace(/\n/g, ' ').replace(/(\s{2,})/g, ' ')
    // remove link
    content = content.replace(/(https?:\/\/[^\s]+)/g, '')
    let title = ''
    if (!content || content.length < 30) {
      title = article.title
    } else {
      title = await sendToBackground({
        name: 'summary',
        body: {
          data: content
        },
      })
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
  if (isLoading) {
    return (
      <div className="flex flex-col p-4 w-96">
        总结中。。。
      </div>
    )
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
  return (
    <div
      className="flex flex-col p-4 w-96">
        <div className="flex flex-col p-2 gap-1">
          {
            data.map((item, index) => {
              return (
                <div key={index} className="flex flex-row justify-between border shadow rounded bg-slate-200 text-base font-bold p-2">
                  <a href={item.url} target="_blank">{item.title}</a>
                  <div><button className="bg-red-500 text-white px-1" onClick={() => deleteItem(index)}>X</button></div>
                </div>
              )
            })
          }
        </div>
      <div className="flex flex-row items-center">
        <button className="border rounded text-lg bg-yellow-400 text-white w-64" onClick={handleClick}>添加当前页</button>
        <button className="border rounded text-lg bg-blue-400 text-white w-64" onClick={copy}>复制</button>
      </div>
    </div>
  )
}

export default IndexPopup