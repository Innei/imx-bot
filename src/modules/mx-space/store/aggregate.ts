import { AggregateRoot } from '@mx-space/api-client'

import { apiClient } from '../api-client'

class AggregateStore {
  public aggregate: AggregateRoot | null = null

  setData(data: AggregateRoot) {
    this.aggregate = { ...data }
  }

  async fetch() {
    const data = await apiClient.aggregate.getAggregateData()
    return data
  }
}

export const aggregateStore = new AggregateStore()
