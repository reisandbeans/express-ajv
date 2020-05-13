import Ajv from 'ajv';
import { createValidator, SchemaCollection, ValidatorOptions } from '../../src';
import { RequestValidator } from '../../src/request-validator';
import { schemas } from '../fixtures/schemas';

jest.mock('../../src/request-validator');

describe('create-validator.spec.ts', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Should throw an error if the schemas to validate requests are not provided', () => {
        expect(createValidator).toThrow('schemas should be an object');
    });

    it('Should return a function that delegates to the request validator', () => {
        const constructorSpy = jest.fn();
        const validatorSpy = jest.fn();
        const ajv = new Ajv();

        (RequestValidator as any).mockImplementation((schemas: SchemaCollection, options?: ValidatorOptions) => {
            constructorSpy(schemas, options);
            return {
                ajv,
                validateSchema: validatorSpy,
            };
        });

        const result = createValidator(schemas);
        // Should create an ajv instance and associate it with the returned function
        expect(result.ajv).toBeDefined();
        expect(constructorSpy).toHaveBeenCalledTimes(1);
        expect(constructorSpy).toHaveBeenCalledWith(schemas, undefined);

        result('someSchema');
        expect(validatorSpy).toHaveBeenCalledTimes(1);
        expect(validatorSpy).toHaveBeenCalledWith('someSchema');
    });

    it('Should return create a validator with the provided options', () => {
        const constructorSpy = jest.fn();
        const validatorSpy = jest.fn();
        const ajv = new Ajv();
        const options = {
            formatError: (err?: any) => err,
        };

        (RequestValidator as any).mockImplementation((schemas: SchemaCollection, options?: ValidatorOptions) => {
            constructorSpy(schemas, options);
            return {
                ajv,
                validateSchema: validatorSpy,
            };
        });

        createValidator(schemas, options);
        // Should create an ajv instance and associate it with the returned function
        expect(constructorSpy).toHaveBeenCalledWith(schemas, options);
    });
});
