import Ajv from 'ajv';
import { forOwn, isFunction } from 'lodash';
import { schemas } from '../fixtures/schemas';
import { RequestValidator } from '../../src/request-validator';
import { ValidatorOptions } from '../../src/types';

describe('request-validator.spec.ts', () => {
    it('Should compile the provided schemas and generate validator functions for them', () => {
        const requestValidator = new RequestValidator(schemas) as any;
        forOwn(schemas, (schema, schemaName) => {
            const validatorFunction = requestValidator.validators[schemaName];
            expect(isFunction(validatorFunction)).toBe(true);
        });
    });

    it('Should throw an error if no schema name is provided', () => {
        const requestValidator = new RequestValidator(schemas) as any;
        expect(requestValidator.getValidatorForSchema).toThrow('Please provide the schema name');
    });

    it('Should throw an error if no validator is found for the provided schema name', () => {
        const requestValidator = new RequestValidator(schemas) as any;
        expect(() => requestValidator.getValidatorForSchema('some-random-schema-name'))
            .toThrow('Validator for schema with name some-random-schema-name not found');
    });

    describe('Request validation', () => {
        function assertErrorUndefined(error?: any) {
            expect(error).toBe(undefined);
        }

        function assertErrorMatchSnapshot(error?: any) {
            expect(error.message).toEqual('validation failed');
            const errorMessages = error.errors.map((validationError: any) => validationError.message);
            expect(errorMessages).toMatchSnapshot();
        }

        function runTest(
            request: any,
            schemaName: string,
            runAssertion: (err: any) => void,
            done: (err?: any) => void,
        ) {
            const options = {
                ajvOptions: {
                    allErrors: true,
                },
            };
            const requestValidator = new RequestValidator(schemas, options);
            const mockResponse: any = {};
            const validatorMiddleware = requestValidator.validateSchema(schemaName);
            validatorMiddleware(request, mockResponse, (error: any) => {
                runAssertion(error);
                done();
            });
        }

        function testValidRequest(schemaName: string, done: (err?: any) => void) {
            const baseData = {
                name: 'Bernardo Reis',
                age: 94,
                city: 'new-york',
            };
            const mockRequest: any = {
                query: baseData,
                body: baseData,
                params: {
                    userId: '576871e16b01de9500a46269',
                },
            };
            runTest(mockRequest, schemaName, assertErrorUndefined, done);
        }

        function testInvalidRequest(schemaName: string, done: (err?: any) => void) {
            const baseData = {
                age: -1,
                city: 'new-york',
            };
            const mockRequest: any = {
                query: baseData,
                body: baseData,
                params: {
                    userId: '1234',
                },
            };
            runTest(mockRequest, schemaName, assertErrorMatchSnapshot, done);
        }

        it('Should not throw errors for a valid get request', (done) => {
            testValidRequest('getRequest', done);
        });

        it('Should not throw errors for a valid post request', (done) => {
            testValidRequest('postRequest', done);
        });

        it('Should return an error for an invalid get request', (done) => {
            testInvalidRequest('getRequest', done);
        });

        it('Should return an error for an invalid post request', (done) => {
            testInvalidRequest('postRequest', done);
        });

        it('Should handle valid data with an asynchronous schema', (done) => {
            testValidRequest('asyncSchema', done);
        });

        it('Should handle invalid data with an asynchronous schema', (done) => {
            testInvalidRequest('asyncSchema', done);
        });
    });

    it('Should use the provided ajv instance', () => {
        const ajv = new Ajv();
        const requestValidator = new RequestValidator(schemas, { ajv });
        expect(requestValidator.ajv).toBe(ajv);
    });

    it('Should create a new ajv instance with the provided options', () => {
        const ajvOptions = {
            allErrors: true,
        };
        const requestValidator = new RequestValidator(schemas, { ajvOptions }) as any;
        const options = requestValidator.ajv._options;
        expect(options).not.toBe(ajvOptions);
    });

    it('Should use a custom formatter to format validation errors', (done) => {
        const options: ValidatorOptions = {
            errorFormatter: (error) => {
                error.message = 'my custom message';
                return error;
            },
        };
        const requestValidator = new RequestValidator(schemas, options);
        const validatorMiddleware = requestValidator.validateSchema('getRequest');
        validatorMiddleware({} as any, {} as any, (error: any) => {
            expect(error.message).toEqual('my custom message');
            done();
        });
    });

    it('Should use a custom function to get the context validation from the request', (done) => {
        const options: ValidatorOptions = {
            contextExtractor: (request: any) => {
                return { foo: request.foo };
            },
        };
        const requestValidator = new RequestValidator(schemas, options) as any;
        const mockRequest = { foo: 'bar' };
        jest.spyOn(requestValidator, 'validate').mockResolvedValue({});

        const validatorMiddleware = requestValidator.validateSchema('getRequest');
        validatorMiddleware(mockRequest as any, {} as any, () => {
            const context = requestValidator.validate.mock.calls[0][2];
            expect(context.foo).toEqual('bar');
            done();
        });
    });
});
