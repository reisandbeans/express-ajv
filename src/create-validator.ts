import { isObject } from 'lodash';
import { SchemaCollection, ValidatorMiddleware, ValidatorOptions } from './types';
import { RequestValidator } from './request-validator';

export function createValidator(schemas: SchemaCollection, options?: ValidatorOptions): ValidatorMiddleware {
    if (!isObject(schemas)) {
        throw new Error('schemas should be an object');
    }

    const validator = new RequestValidator(schemas, options);
    const validatorMiddleware = (schema: string) => validator.validateSchema(schema);
    return Object.assign(validatorMiddleware, { ajv: validator.ajv }) as ValidatorMiddleware;
}
