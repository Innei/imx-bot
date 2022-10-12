export class RequestQueue {
  private queue: Promise<any>[] = []
  private max = 10
  private current = 0

  constructor(max = 10) {
    this.max = max
  }
}
