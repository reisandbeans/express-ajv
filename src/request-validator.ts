import { forOwn, pick } from 'lodash';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import Ajv, { ValidateFunction } from 'ajv';
import { SchemaCollection, ValidatorOptions } from './types';

export class RequestValidator {
    ajv: Ajv.Ajv;
    private validators: { [schemaName: string]: ValidateFunction } = {};
    private errorFormatter: (error: any) => any;
    private contextExtractor: (req: Request) => any;

    constructor(
        schemas: SchemaCollection,
        options?: ValidatorOptions,
    ) {
        this.ajv = options?.ajv ?? new Ajv(options?.ajvOptions);
        this.errorFormatter = options?.errorFormatter ?? this.defaultErrorFormatter;
        this.contextExtractor = options?.contextExtractor ?? this.defaultValidationContext;
        this.registerSchemas(schemas);
    }

    private registerSchemas(schemaCollection: { [schemaName: string]: object }) {
        forOwn(schemaCollection, (schema: object, schemaName: string) => {
            const validator = this.ajv.compile(schema);
            this.validators[schemaName] = validator;
        });
    }

    private getValidatorForSchema(schemaName: string) {
        if (!schemaName) {
            throw new Error('Please provide the schema name');
        }

        const validator = this.validators[schemaName];
        if (!validator) {
            throw new Error(`Validator for schema with name ${schemaName} not found`);
        }
        return validator;
    }

    private defaultErrorFormatter(error: any) {
        return error;
    }

    private defaultValidationContext(req: Request) {
        return {};
    }

    validateSchema(schemaName: string) {
        const validator = this.getValidatorForSchema(schemaName);

        const middleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
            const contextParams = this.contextExtractor(req);
            const context = Object.assign({}, this.ajv, contextParams);
            const dataToValidate = pick(req, ['body', 'params', 'query']);

            return this.validate(dataToValidate, validator, context)
                .then(() => next())
                .catch((error) => {
                    const formattedError = this.errorFormatter(error);
                    next(formattedError);
                });
        };

        return middleware;
    }

    private validate(data: any, validator: ValidateFunction, context: any) {
        return validator.$async
            ? this.validateAsync(data, validator, context)
            : this.validateSync(data, validator, context);
    }

    private validateSync(data: any, validator: ValidateFunction, context: any) {
        const valid = validator.call(context, data);
        return valid
            ? Promise.resolve()
            : Promise.reject(new Ajv.ValidationError(validator.errors!));
    }

    private validateAsync(data: any, validator: ValidateFunction, context: any) {
        return validator.call(context, data) as Promise<any>;
    }
}
