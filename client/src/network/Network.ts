export class Network {
    private ws: WebSocket | null = null;
    private onInitCallback: ((data: any) => void) | null = null;
    private onUpdateCallback: ((data: any) => void) | null = null;
    private onChatCallback: ((data: any) => void) | null = null;
    private onStatusCallback: ((data: any) => void) | null = null;

    constructor(private url: string) {}

    connect() {
        this.ws = new WebSocket(this.url);
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case 'init':
                    if (this.onInitCallback) this.onInitCallback(data.payload);
                    break;
                case 'update':
                    if (this.onUpdateCallback) this.onUpdateCallback(data.payload);
                    break;
                case 'chat':
                    if (this.onChatCallback) this.onChatCallback(data.payload);
                    break;
                case 'status':
                    if (this.onStatusCallback) this.onStatusCallback(data.payload);
                    break;
            }
        };
    }

    send(type: string, payload: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, payload }));
        }
    }

    onInit(cb: (data: any) => void) { this.onInitCallback = cb; }
    onUpdate(cb: (data: any) => void) { this.onUpdateCallback = cb; }
    onChat(cb: (data: any) => void) { this.onChatCallback = cb; }
    onStatus(cb: (data: any) => void) { this.onStatusCallback = cb; }
}
