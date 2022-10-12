import chalk from 'chalk'
import type { FancyReporterOptions } from 'consola'
import { Consola, FancyReporter, LogLevel } from 'consola'
import rc from 'randomcolor'

import { isDev } from '~/constants/env'

import { getShortTime } from './time'

const logger = new Consola({
  reporters: [new FancyReporter()],
  level: isDev ? LogLevel.Verbose : LogLevel.Info,
})
export const registerLogger = () => {
  logger.wrapAll()
  ;(global as any).consola = logger
}
export { logger as consola }
class NameSpaceReporter extends FancyReporter {
  private color: string
  constructor(public namespace: string, options?: FancyReporterOptions) {
    super(options)

    this.color = rc({
      format: 'hex',
      seed: namespace,
      luminosity: 'light',
    })
  }
  protected formatDate() {
    return ''
  }
  protected formatLogObj(): string {
    const prefix = `${chalk.hex(this.color)(this.namespace)}: `
    return `${chalk.yellow(
      getShortTime(new Date()),
      // @ts-ignore
      // eslint-disable-next-line prefer-rest-params
    )} ${prefix}${super.formatLogObj.apply(this, arguments)}`.trimEnd()
  }
}

export const createNamespaceLogger = (namespace: string): Consola => {
  const logger = new Consola({
    reporters: [new NameSpaceReporter(namespace)],
    level: isDev ? LogLevel.Verbose : LogLevel.Info,
  })

  return logger
}
