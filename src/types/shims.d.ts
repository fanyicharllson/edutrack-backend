declare module "express" {
  export interface Request {
    [key: string]: unknown;
  }

  export interface Response {
    json(body: unknown): Response;
    status(code: number): Response;
    send(body?: unknown): Response;
  }

  export interface NextFunction {
    (err?: unknown): void;
  }

  export interface RequestHandler {
    (req: Request, res: Response, next: NextFunction): unknown;
  }

  export interface Express {
    use(...handlers: unknown[]): Express;
    get(path: string, handler: RequestHandler): Express;
    listen(port: number, callback?: () => void): unknown;
    json(): RequestHandler;
  }

  function express(): Express;

  namespace express {
    function json(): RequestHandler;
  }

  export default express;
}

declare module "cors" {
  import type { RequestHandler } from "express";

  function cors(): RequestHandler;

  export default cors;
}