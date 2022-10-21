import type { GroupMessageEvent } from 'oicq'

import type { CoCallerAction } from '~/utils/co'

export type GroupCoRoutine = (
  this: CoCallerAction,
  message: GroupMessageEvent,
) => void
