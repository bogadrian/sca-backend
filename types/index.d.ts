declare module 'xss-clean'
declare module 'express-rate-limiter'
declare module 'xss-clean'{
    var _a: any;
    export = _a;
}

declare namespace Express {
    export interface Request {
        user: any;
    }
}