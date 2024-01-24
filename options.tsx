import { useStorage } from "@plasmohq/storage/hook"
import "./style.css"
function IndexOptions() {
  const [useAI, setUseAI] = useStorage<boolean>("use-ai", false)
  const [isChangeTitle, setIsChangeTitle] = useStorage<boolean>("is-change-title", true)
  const [sk, setSk] = useStorage<string>("openai-api-key")
  const [baseUrl, setBaseUrl] = useStorage<string>("openai-base-url", "https://api.openai.com/v1")
  return (
    <div className="flex flex-row justify-center">
    <div className="flex flex-col items-center border-gray-900/10 p-4 sm:w-96 min-w-96 md:w-1/2 xl:1/3">
      <h2 className="text-base font-semibold leading-7 text-gray-900">设置 Settings</h2>
      <div className="w-full flex-row">
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
            是否启用 AI 能力(自动生成标题，总结，判断是否是广告)
          </label>
        </div>
      </div>
      { 
        useAI && <div className="w-full flex-row">
          <div className="flex h-6 items-center">
            <input
              id="change-title"
              checked={isChangeTitle}
              onChange={(e) => setIsChangeTitle(e.target.checked)}
              name="change-title"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="change-title" className="text-xl text-gray-900">
              是否自动用 AI 生成新标题
            </label>
          </div>
        </div>
      }
      {
        useAI && (
          <div className="w-full mt-2">
            <label htmlFor="first-name" className="block text-xl font-medium leading-6 text-gray-900">
              OpenAI 秘钥
            </label>
            <div className="">
              <input
                value={sk}
                onChange={(e) => setSk(e.target.value)}
                type="text"
                name="first-name"
                id="first-name"
                className=" text-base px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        )
      }
      {
        useAI && (
        <div className="mt-2 w-full">
          <label htmlFor="last-name" className="block text-xl font-medium leading-6 text-gray-900">
            OpenAI BaseUrl
          </label>
          <div className="">
            <input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              type="text"
              name="last-name"
              id="last-name"
              placeholder="https://api.openai.com/v1"
              autoComplete="family-name"
              className="text-base px-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        )
      }
    </div>
    </div>
  )
}

export default IndexOptions
