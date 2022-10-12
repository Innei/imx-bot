import type { UserModel } from '@mx-space/api-client'

import { apiClient } from '../api-client'

class UserStore {
  public user: UserModel | null = null

  setUser(user: UserModel) {
    this.user = { ...user }
  }

  async fetchUser() {
    const user = await apiClient.user.getMasterInfo()
    return user
  }
}

export const userStore = new UserStore()
