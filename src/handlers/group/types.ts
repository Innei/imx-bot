import type { GroupMessageEvent, MessageElem } from 'oicq'

import type { CoCallerAction } from '@innei/next-async'

export type GroupCoRoutine = (
  this: CoCallerAction,
  message: GroupMessageEvent,
) => void

declare module 'oicq' {
  export interface GroupMessageEvent {
    commandName?: string
    commandArgs?: string
    commandParsedArgs?: any
    commandMessage?: TextElem

    shouldQuote?: boolean
  }

  interface TextElem {
    commandName?: string
    commandArgs?: string
    commandParsedArgs?: any
    messageElems?: MessageElem[]
  }
}
