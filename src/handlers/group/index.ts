import type { GroupMessageEvent } from 'oicq'

import { Co } from '~/utils/co'

import { commandMessageRoutine } from './tasks/handleCommand'
import { mentionRoutine } from './tasks/handleMention'
import { groupSingleTextMessageAction } from './tasks/handleSingle'

export const groupMessageHandler = async (e: GroupMessageEvent) => {
  consola.debug(e.message)
  const coTask = new Co()
  coTask.use(
    groupSingleTextMessageAction,
    mentionRoutine,
    commandMessageRoutine,
  )
  await coTask.start(e)

  return
}
