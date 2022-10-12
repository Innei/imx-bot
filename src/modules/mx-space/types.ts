import type { Client } from 'oicq'
import type { Socket } from 'socket.io-client'

import type { AggregateRoot } from '@mx-space/api-client'

export type MxContext = {
  socket: Socket
  client: Client

  aggregationData: AggregateRoot

  refreshData: () => Promise<void>
}
