import { RequestHandler, Request } from 'express';
import Ajv, { Options as AjvOptions } from 'ajv';

export interface RequestSchema {
    type: 'object';
    properties: {
        body?: object;
        params?: object;
        query?: object;
    };
    required?: string[];
    [key: string]: any;
}

export interface ValidatorOptions {
    ajv?: Ajv.Ajv;
    ajvOptions?: AjvOptions;
    formatError?: (error: any) => any;
    getContextParams?: (req: Request) => any;
}

export type SchemaCollection = { [schemaName: string]: RequestSchema };

export interface ValidatorMiddleware {
    ajv: Ajv.Ajv;
    (schemaName: string): RequestHandler;
}
