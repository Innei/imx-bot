import type { GroupMessageEvent } from 'oicq'

import { Co } from '@innei/next-async'

import { commandMessageRoutine } from './tasks/handleCommand'
import { mentionRoutine } from './tasks/handleMention'
import { multiMessageElemRoutine } from './tasks/handleMuti'
import { groupSingleTextMessageAction } from './tasks/handleSingle'

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  consola.debug(e.message)
  const coTask = new Co(
    {},
    {
      automaticNext: false,
      catchAbortError: true,
    },
  )
  coTask.use(
    groupSingleTextMessageAction,
    mentionRoutine,
    multiMessageElemRoutine,
    commandMessageRoutine,
  )
  await coTask.start(e)

  return
}
