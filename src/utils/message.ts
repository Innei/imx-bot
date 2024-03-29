import type { TextElem } from 'icqq'
import yargs from 'yargs'

export const praseCommandMessage = async (
  messageText: string,
  messageEl?: TextElem,
) => {
  // replace mac qq auto replace `--` to ch `—`
  const args = await yargs.parse(messageText.replace(/—/g, '--'), {})
  const commandName = args._[0]

  const result = {
    commandName: String(commandName).slice(1).replaceAll('-', '_'),
    commandParsedArgs: args,
    commandArgs: messageText.split(' ')[1],
  }

  if (messageEl) {
    messageEl.commandName = result.commandName
    messageEl.commandParsedArgs = result.commandParsedArgs

    messageEl.commandArgs = result.commandArgs
  }
  return result
}

export function checkIsSendable(obj: any) {
  if (!obj) {
    return false
  }
  return typeof obj === 'string' || (typeof obj === 'object' && 'type' in obj)
}
