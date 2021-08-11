import * as http from "http";
import * as https from "https";
import * as SocketIO from "socket.io";

/**
 * Available options for WebSockets object
 */
export interface WebSocketsOptions 
{
    enable?: boolean,
    options?: any /*SocketIO.ServerOptions*/
}

/**
 * Available targets for websockets features (websockets on http, https or both)
 */
export enum WebsocketTarget
{
    BOTH = 0,
    HTTP = 1,
    HTTPS = 2
}

/**
 * WebSockets manager
 */
export class WebSockets
{
    //Websockets options
    private readonly _websocketsOptions : SocketIO.ServerOptions | undefined;
    public get websocketsOptions() : SocketIO.ServerOptions | undefined {return this._websocketsOptions; }

    //Websocket server for http requests
    private readonly _httpWebsocketServer: SocketIO.Server | null;
    
    //Websocket server for https requests
    private readonly _httpsWebsocketServer: SocketIO.Server | null;

    /**
     * Constructor
     * @param httpServer Websocket server for http requests
     * @param httpsServer Websocket server for https requests
     * @param options Websocket options
     */
    constructor(httpServer: http.Server | null, httpsServer : https.Server | null, options: WebSocketsOptions)
    {
        this._websocketsOptions = options.options;
        
        this._httpWebsocketServer = httpServer && options.enable ? new SocketIO.Server(httpServer, this.websocketsOptions) : null;
        this._httpsWebsocketServer = httpsServer && options.enable ? new SocketIO.Server(httpsServer, this.websocketsOptions) : null;
    }

    /**
     * Adds a listener on the websocket server
     * @param eventName Event to listen
     * @param callback Function to call on event
     * @param target HTTP requests only, HTTPS requests only or BOTH
     */
    public addGlobalListener(eventName: string, callback: (... args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.on(eventName, callback);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.on(eventName, callback);
    }

    /**
     * Removes a listener on the websocket server
     * @param eventName Event to remove
     * @param target HTTP requests only, HTTPS requests only or BOTH
     */
    public removeGlobalListener(eventName: string, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.removeAllListeners(eventName);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.removeAllListeners(eventName);
    }

    /**
     * Adds a middleware on the websocket server
     * @param middleware Middleware to add
     * @param target HTTP requests only, HTTPS requests only or BOTH
     */
    public addMiddleware(middleware: (...args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.use(middleware);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.use(middleware);
    }
    
    /**
     * Emits en event to all client websockets
     * @param action Name of the event to emit
     * @param data Data to transmit
     * @param target HTTP sockets only, HTTPS sockets only or BOTH
     */
    public emit(eventName: string, data: any[] = [], target: WebsocketTarget = WebsocketTarget.BOTH)
    {        
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsocketServer?.emit(eventName, data);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsocketServer?.emit(eventName, data);
    }
}