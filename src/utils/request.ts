export class RequestQueue {
  private queue: (() => Promise<any>)[] = []

  private current = 0

  constructor(private max = 10) {}

  add(task: (current: number, total: number) => Promise<any>) {
    const next = () => {
      this.current--
      this.next()
    }

    if (this.current < this.max) {
      this.current++

      this.queue.push(() => task(this.current, this.queue.length).finally(next))
    }
  }

  async start() {
    while (this.queue.length) {
      const task = this.queue.shift()
      await task?.()
    }
  }

  next() {}
}
