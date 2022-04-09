import chalk from 'chalk'
import { Consola, FancyReporter, FancyReporterOptions } from 'consola'

import { getShortTime } from './time'

export const registerLogger = () => {
  const logger = new Consola({
    reporters: [new FancyReporter()],
  })

  logger.wrapAll()
  ;(global as any).consola = logger
}
const coloredNamespaceMap = {} as Record<string, string>
class NameSpaceReporter extends FancyReporter {
  private color: string
  constructor(public namespace: string, options?: FancyReporterOptions) {
    super(options)

    if (coloredNamespaceMap[namespace]) {
      this.color = coloredNamespaceMap[namespace]
    } else {
      this.color = `#${Math.floor(Math.random() * 16777215).toString(16)}`
      coloredNamespaceMap[namespace] = this.color
    }
  }
  protected formatDate() {
    return ''
  }
  protected formatLogObj(): string {
    const prefix = `${chalk.hex(this.color)(this.namespace)}: `
    return `${chalk.yellow(
      getShortTime(new Date()),
      // eslint-disable-next-line prefer-rest-params
    )} ${prefix}${super.formatLogObj.apply(this, arguments)}`.trimEnd()
  }
}

export const createNamespaceLogger = (namespace: string): Consola => {
  const logger = new Consola({
    reporters: [new NameSpaceReporter(namespace)],
  })

  return logger
}
