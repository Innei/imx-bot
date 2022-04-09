import { Consola } from 'consola'

export {}
declare global {
  export const consola: Consola

  interface globalThis {
    [key: string]: any
  }
}
