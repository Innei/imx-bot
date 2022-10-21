import type { GroupCoRoutine } from '../types'

export const commandMessageRoutine: GroupCoRoutine = async function (event) {
  if (!event.commandMessage) {
    this.next()
    return
  }

  this.abort()
}
