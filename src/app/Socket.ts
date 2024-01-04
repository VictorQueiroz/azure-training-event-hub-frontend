export default class Socket {
  private readonly ws;
  private readonly webSocketQueue = new Array<unknown>();

  public constructor(url: string) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      for (const msg of this.webSocketQueue.splice(
        0,
        this.webSocketQueue.length
      )) {
        this.send(msg);
      }
    };
  }

  public send(msg: unknown) {
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.webSocketQueue.push(msg);
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }
}
