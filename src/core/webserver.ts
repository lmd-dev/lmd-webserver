import Express from "express";
import { Middlewares } from "./middlewares/middlewares";
import { Routers } from "./routers/routers";
import * as http from "http";
import * as https from "https";
import Session from "express-session";
import * as SocketIO from "socket.io";

export interface WebServerOptions
{
    http?: {
        port?: number;
        enable?: boolean;
    },
    https?: {
        port?: number;
        enable?: boolean;
        privateKey?: string;
        certificate?: string;
    },
    sessions?: {
        enable?: boolean;
        passPhrase?: string;
    },
    websockets?: {
        enable?: boolean,
        options?: any /*SocketIO.ServerOptions*/
    }
}

export enum WebsocketTarget
{
    BOTH = 0,
    HTTP = 1,
    HTTPS = 2
}

export class WebServer
{
    private readonly _httpPort: number;
    public get httpPort(): number { return this._httpPort; }

    private _enableHttp: boolean;
    public get enableHttp(): boolean { return this._enableHttp; }

    private readonly _httpsPort: number;
    public get httpsPort(): number { return this._httpsPort; }

    private readonly _enableHttps: boolean;
    public get enableHttps(): boolean { return this._enableHttps; }

    private readonly _privateKey: string;
    public get privateKey(): string { return this._privateKey; }

    private readonly _certificate: string;
    public get certificate(): string { return this._certificate; }

    private readonly _enableSessions: boolean;
    public get enableSessions(): boolean { return this._enableSessions; }

    private readonly _sessionPassPhrase: string;
    public get sessionPassPhrase(): string { return this._sessionPassPhrase; }

    private readonly _enableWebsockets : boolean;
    public get enableWebsockets() : boolean {return this._enableWebsockets; }

    private readonly _websocketsOptions : SocketIO.ServerOptions | undefined;
    public get websocketsOptions() : SocketIO.ServerOptions | undefined {return this._websocketsOptions; }
    
    private readonly _express: Express.Application;
    private readonly _httpServer : http.Server | null;    
    private readonly _httpsServer : https.Server | null;
    private readonly _httpWebsockets: SocketIO.Server | null;
    private readonly _httpsWebsockets: SocketIO.Server | null;

    private readonly _routers: Routers;
    public get routers(): Routers { return this._routers; }

    private readonly _middlewares: Middlewares;
    public get middlewares(): Middlewares { return this._middlewares; }

    /**
     * Constructor
     * @param port Number of the port to listen 
     */
    constructor(options: WebServerOptions)
    {
        this._httpPort = options.http?.port ?? 80;
        this._enableHttp = options.http?.enable ?? false;

        this._httpsPort = options.https?.port ?? 443;
        this._enableHttps = options.https?.enable ?? false;
        this._privateKey = options.https?.privateKey ?? "";
        this._certificate = options.https?.certificate ?? "";

        this._enableSessions = options.sessions?.enable ?? false;
        this._sessionPassPhrase = options.sessions?.passPhrase ?? "";

        this._enableWebsockets = options.websockets?.enable ?? false;
        this._websocketsOptions = options.websockets?.options;

        this._express = Express();
        this._httpServer = this._enableHttp ? http.createServer(this._express) : null;
        this._httpsServer = this._enableHttps ? https.createServer({ key: this.privateKey, cert: this.certificate }, this._express): null;
        this._httpWebsockets = this._httpServer && this._enableWebsockets ? new SocketIO.Server(this._httpServer, this.websocketsOptions) : null;
        this._httpsWebsockets = this._httpsServer && this._enableWebsockets ? new SocketIO.Server(this._httpsServer, this.websocketsOptions) : null;

        this._routers = new Routers(this._express);
        this._middlewares = new Middlewares(this._express);
        
        this.activateBodyParsing();
        this.activateSessions();
    }

    /**
     * Starts the web server
     */
    public start()
    {
        this.middlewares.connect();

        this.startHttp();
        this.startHttps();
    }

    private activateBodyParsing()
    {
        this._express.use(Express.json());
        this._express.use(Express.urlencoded({ extended: true }));
    }

    private activateSessions()
    {
        if (this.enableSessions)
        {
            this._express.use(Session({
                secret: this.sessionPassPhrase,
                resave: false,
                saveUninitialized: true,
                cookie: { secure: this.enableHttps }
            }));
        }
    }

    private startHttp()
    {
        if (this._enableHttp && this._httpServer)
        {
            this._httpServer.listen(this.httpPort);
        }
    }

    private startHttps()
    {
        if (this._enableHttps && this._httpsServer)
        {
            this._httpsServer.listen(this.httpsPort);
        }
    }

    public addWebsocketsAction(action: string, callback: (... args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsockets?.on(action, callback);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsockets?.on(action, callback);
    }

    public addWebsocketsMiddleware(middleware: (...args: any[]) => void, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsockets?.use(middleware);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsockets?.use(middleware);
    }

    public emitWebsockets(action: string, target: WebsocketTarget = WebsocketTarget.BOTH)
    {
        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTP)
            this._httpWebsockets?.emit(action);

        if(target === WebsocketTarget.BOTH || target === WebsocketTarget.HTTPS)
            this._httpsWebsockets?.emit(action);
    }
}