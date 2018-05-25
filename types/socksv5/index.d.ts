// Type definitions for socksv5 0.0
// Project: https://github.com/mscdex/socksv5
// Definitions by: My Self <https://github.com/me>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module "socksv5" {
  export class HttpAgent {
    constructor(options: any);

    addRequest(req: any, options: any, ...args: any[]): void;

    createConnection(...args: any[]): any;

    createSocket(req: any, options: any): any;

    destroy(): void;

    getName(options: any): any;

    removeSocket(s: any, options: any): void;

    static defaultMaxSockets: number;

  }

  export class HttpsAgent {
    constructor(options: any);

    createConnection(port: any, host: any, options: any): any;

    getName(options: any): any;

  }

  export const auth: any;

}
