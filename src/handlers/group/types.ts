import type { GroupMessageEvent, MessageElem } from 'icqq'
import type { CoCallerAction } from '@innei/next-async'

export type GroupCoRoutine = (
  this: CoCallerAction,
  message: GroupMessageEvent,
) => void

declare module 'icqq' {
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
