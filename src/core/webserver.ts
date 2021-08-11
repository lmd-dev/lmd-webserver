import Express from "express";
import { Middlewares } from "./middlewares/middlewares";
import { Routers } from "./routers/routers";
import * as http from "http";
import * as https from "https";
import Session from "express-session";
import { WebSockets, WebSocketsOptions } from "./websockets/websockets";

/**
 * Available options for the webserver
 */
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
    websockets?: WebSocketsOptions
}

/**
 * WebServer
 */
export class WebServer
{
    //Listening port for http requests
    private _httpPort: number;
    public get httpPort(): number { return this._httpPort; }

    //Is http server enabled ?
    private _enableHttp: boolean;
    public get enableHttp(): boolean { return this._enableHttp; }

    //Listening port for https requests
    private _httpsPort: number;
    public get httpsPort(): number { return this._httpsPort; }

    //Is https server enabled ?
    private _enableHttps: boolean;
    public get enableHttps(): boolean { return this._enableHttps; }

    //Private key of the SSL certificate for https connexions
    private _privateKey: string;
    public get privateKey(): string { return this._privateKey; }

    //SSL certificate for https connexions
    private _certificate: string;
    public get certificate(): string { return this._certificate; }

    //Are sessions enabled ?
    private _enableSessions: boolean;
    public get enableSessions(): boolean { return this._enableSessions; }

    //Passphrase used to encrypt sessions data
    private _sessionPassPhrase: string;
    public get sessionPassPhrase(): string { return this._sessionPassPhrase; }

    //Are websockets enabled ?
    private _enableWebsockets: boolean;
    public get enableWebsockets(): boolean { return this._enableWebsockets; }

    //Websockets options
    private _websocketsOptions: WebSocketsOptions;
    public get websocketsOptions(): WebSocketsOptions { return this._websocketsOptions; }

    //Express application on which is based the webserver
    private _express: Express.Application;

    //HTTP Server
    private _httpServer: http.Server | null;

    //HTTPS Server
    private _httpsServer: https.Server | null;

    //Websockets manager
    private _websockets: WebSockets | null;
    public get websockets(): WebSockets | null { return this._websockets; }

    //Base routers
    private readonly _routers: Routers;
    public get routers(): Routers { return this._routers; }

    //Base middlewares
    private readonly _middlewares: Middlewares;
    public get middlewares(): Middlewares { return this._middlewares; }

    /**
     * Constructor
     * @param options Webserver options 
     */
    constructor(options: WebServerOptions | null)
    {
        this._httpPort = 80;
        this._enableHttp = false;

        this._httpsPort = 443;
        this._enableHttps = false;
        this._privateKey = "";
        this._certificate = "";

        this._enableWebsockets = false;
        this._websocketsOptions = {};

        this._enableSessions = false;
        this._sessionPassPhrase = "";

        this._express = Express();
        this._httpServer = null;
        this._httpsServer = null;
        this._websockets = null;

        this._routers = new Routers(this._express);
        this._middlewares = new Middlewares(this._express);

        if (options)
            this.setOptions(options);
    }

    /**
     * Defines webserver options
     * @param options Options of the webserver
     */
    setOptions(options: WebServerOptions)
    {
        this.stop();

        this._httpPort = options.http?.port ?? 80;
        this._enableHttp = options.http?.enable ?? false;

        this._httpsPort = options.https?.port ?? 443;
        this._enableHttps = options.https?.enable ?? false;
        this._privateKey = options.https?.privateKey ?? "";
        this._certificate = options.https?.certificate ?? "";

        this._enableWebsockets = options.websockets?.enable ?? false;
        this._websocketsOptions = options.websockets ?? {};

        this._enableSessions = options.sessions?.enable ?? false;
        this._sessionPassPhrase = options.sessions?.passPhrase ?? "";

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
        this.startWebSockets();
    }

    /**
     * Stops the webserver
     */
    public stop()
    {
        if (this._httpServer && this._httpServer.listening)
            this._httpServer.close();

        if (this._httpsServer && this._httpsServer.listening)
            this._httpsServer.close();
    }

    /**
     * Enables body parsing
     */
    private activateBodyParsing()
    {
        this._express.use(Express.json());
        this._express.use(Express.urlencoded({ extended: true }));
    }

    /**
     * Enables sessions
     */
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

    /**
     * Starts HTTP server
     */
    private startHttp()
    {
        if (this._enableHttp)
        {
            this._httpServer = http.createServer(this._express);
            this._httpServer.listen(this.httpPort);
        }
    }

    /**
     * Starts HTTPS server
     */
    private startHttps()
    {
        if (this._enableHttps)
        {
            this._httpsServer = https.createServer({ key: this.privateKey, cert: this.certificate }, this._express)
            this._httpsServer.listen(this.httpsPort);
        }
    }

    /**
     * Starts websockets
     */
    private startWebSockets()
    {
        if (this._enableWebsockets)
        {
            this._websockets = new WebSockets(this._httpServer, this._httpsServer, this._websocketsOptions);
        }
    }
}