import { Platform } from 'oicq'

export const botConfig = {
  groupIds: [615052447, 615052525],

  password: '',
  uid: 926284623,
  ownerId: 1003521738,

  platform: Platform.iMac,

  githubHook: {
    secret: '',
    port: 7777,
    mentionId: 1003521738,
    watchGroupIds: [
      615052525,
      // 615052525
    ],
  },

  bilibili: {
    live: {
      id: 1434499,
      atAll: true,
    },
    watchGroupIds: [
      615052525,
      // 615052525
    ],
  },

  errorNotify: {
    groupId: 615052525,
  },

  mxSpace: {
    apiEndpoint: 'https://api.innei.ren/v2',
    gateway: 'https://api.innei.ren/system',
    token: '',

    watchGroupIds: [
      615052525,
      // 615052525
    ],
  },
  novelai: {
    token: '',
  },
  chatgpt: {
    token: '',
  }
}
