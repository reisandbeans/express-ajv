/// <reference types="qs" />
import { RequestHandler } from 'express';
import Ajv from 'ajv';
import { SchemaCollection, ValidatorOptions } from './types';
export declare class RequestValidator {
    ajv: Ajv.Ajv;
    private validators;
    private contextExtractor;
    constructor(schemas: SchemaCollection, options?: ValidatorOptions);
    private registerSchemas;
    private getValidatorForSchema;
    private defaultValidationContext;
    validateSchema(schemaName: string): RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs>;
    private validate;
    private validateSync;
    private validateAsync;
}
