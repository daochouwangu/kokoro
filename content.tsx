import { useMessage } from "@plasmohq/messaging/hook"
import type { PlasmoCSConfig } from "plasmo"
 
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true,
}
export const getPageHtml = () => {
  useMessage<string, string>(async (req, res) => {
    const article = document.querySelector('article')
    if (article) {
      res.send(article.outerHTML);
      return
    }
    const html = document.documentElement.innerHTML
    res.send(html);
  })
  return (
    <></>
  )
}

export default getPageHtml