import { Client } from 'oicq'
import { Socket } from 'socket.io-client'

import { AggregateRoot } from '@mx-space/api-client'

export type MxContext = {
  socket: Socket
  client: Client

  aggregationData: AggregateRoot

  refreshData: () => Promise<void>
}
