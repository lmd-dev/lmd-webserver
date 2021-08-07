import * as http from "http";
import * as https from "https";
import * as SocketIO from "socket.io";

export interface WebSocketsOptions 
{
    enable?: boolean,
    options?: SocketIO.ServerOptions
}

export enum WebsocketTarget
{
    BOTH = 0,
    HTTP = 1,
    HTTPS = 2
}

export class WebSockets
{
    private readonly _websocketsOptions : SocketIO.ServerOptions | undefined;
    public get websocketsOptions() : SocketIO.ServerOptions | undefined {return this._websocketsOptions; }

    private readonly _httpWebsocketServer: SocketIO.Server | null;
    private readonly _httpsWebsocketServer: SocketIO.Server | null;

    constructor(httpServer: http.Server | null, httpsServer : https.Server | null, options: WebSocketsOptions)
    {
        this._websocketsOptions = options.options;
        
        this._httpWebsocketServer = httpServer && options.enable ? new SocketIO.Server(httpServer, this.websocketsOptions) : null;
        this._httpsWebsocketServer = httpsServer && options.enable ? new SocketIO.Server(httpsServer, this.websocketsOptions) : null;
    }

    public addGlobalListener(eventName: string, callback: (... args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.on(eventName, callback);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.on(eventName, callback);
    }

    public removeGlobalListener(eventName: string, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.removeAllListeners(eventName);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.removeAllListeners(eventName);
    }

    public addMiddleware(middleware: (...args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.use(middleware);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.use(middleware);
    }

    public emit(action: string, data: any[] = [], target: WebsocketTarget = WebsocketTarget.BOTH)
    {        
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.emit(action, data);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.emit(action, data);
    }
}