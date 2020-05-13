import { RequestHandler, Request } from 'express';
import Ajv, { Options as AjvOptions } from 'ajv';

export interface RequestSchema {
    body?: object;
    params?: object;
    query?: object;
}

export interface ValidatorOptions {
    ajv?: Ajv.Ajv;
    ajvOptions?: AjvOptions;
    formatError?: (error: any) => any;
    getContextParams?: (req: Request) => any;
}

export type SchemaCollection = { [schemaName: string]: object };

export interface ValidatorMiddleware {
    ajv: Ajv.Ajv;
    (schemaName: string): RequestHandler;
}
