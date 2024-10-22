import { useStorage } from "@plasmohq/storage/hook"

import "./style.css"

const AI_PLATFORMS = [
  { id: "openai", name: "OpenAI" },
  { id: "01ai", name: "01万物" }
  // { id: "kimi", name: "Kimi" },
  // { id: "bytedance", name: "字节" }
]

function IndexOptions() {
  const [useAI, setUseAI] = useStorage<boolean>("use-ai", false)
  const [isChangeTitle, setIsChangeTitle] = useStorage<boolean>(
    "is-change-title",
    true
  )
  const [selectedPlatform, setSelectedPlatform] = useStorage<string>(
    "ai-platform",
    "openai"
  )
  const [apiKeys, setApiKeys] = useStorage<Record<string, string>>(
    "ai-api-keys",
    {}
  )
  const [baseUrl, setBaseUrl] = useStorage<string>(
    "ai-base-url",
    "https://api.openai.com/v1"
  )

  const handleApiKeyChange = (platform: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [platform]: value }))
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col items-center border-gray-900/10 p-4 sm:w-96 min-w-96 md:w-1/2 xl:1/3">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          {chrome.i18n.getMessage("settings")}
        </h2>

        {/* 使用AI选项 */}
        <div className="w-full flex-row">
          <div className="flex h-6 items-center">
            <input
              id="use-ai"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
            <label htmlFor="use-ai" className="text-xl text-gray-900 ml-2">
              {chrome.i18n.getMessage("label_useai")}
            </label>
          </div>
        </div>

        {useAI && (
          <>
            {/* 更改标题选项 */}
            <div className="w-full flex-row mt-4">
              <div className="flex h-6 items-center">
                <input
                  id="change-title"
                  checked={isChangeTitle}
                  onChange={(e) => setIsChangeTitle(e.target.checked)}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="change-title"
                  className="text-xl text-gray-900 ml-2">
                  {chrome.i18n.getMessage("label_changetitle")}
                </label>
              </div>
            </div>

            {/* AI平台选择 */}
            <div className="w-full mt-4">
              <label
                htmlFor="ai-platform"
                className="block text-xl font-medium leading-6 text-gray-900">
                选择AI平台
              </label>
              <select
                id="ai-platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
                {AI_PLATFORMS.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API密钥输入 */}
            {AI_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="w-full mt-4"
                style={{
                  display: selectedPlatform === platform.id ? "block" : "none"
                }}>
                <label
                  htmlFor={`${platform.id}-api-key`}
                  className="block text-xl font-medium leading-6 text-gray-900">
                  {platform.name} API Key
                </label>
                <input
                  type="password"
                  id={`${platform.id}-api-key`}
                  value={apiKeys[platform.id] || ""}
                  onChange={(e) =>
                    handleApiKeyChange(platform.id, e.target.value)
                  }
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            ))}

            {/* Base URL输入（仅对OpenAI显示） */}
            {selectedPlatform === "openai" && (
              <div className="w-full mt-4">
                <label
                  htmlFor="base-url"
                  className="block text-xl font-medium leading-6 text-gray-900">
                  OpenAI Base URL
                </label>
                <input
                  type="text"
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default IndexOptions
