import { botConfig } from 'config'
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
  apiKey: botConfig.chatgpt.token,
})
const openai = new OpenAIApi(configuration)
