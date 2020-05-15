import { createGetRequestSchema, createPostRequestSchema } from '../../src';

describe('request-schema.spec.ts', () => {
    const baseSchema = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
        },
    };

    const paramsSchema = {
        type: 'object',
        properties: {
            userId: {
                type: 'string',
            },
        },
    };

    it('Should wrap the provided schema with the standard get request schema format without params', () => {
        const result = createGetRequestSchema(baseSchema);
        expect(result).toMatchSnapshot();
    });

    it('Should wrap the provided schema with the standard get request schema format with params', () => {
        const result = createGetRequestSchema(baseSchema, paramsSchema);
        expect(result).toMatchSnapshot();
    });

    it('Should wrap the provided schema with the standard post request schema format without params', () => {
        const result = createPostRequestSchema(baseSchema);
        expect(result).toMatchSnapshot();
    });

    it('Should wrap the provided schema with the standard post request schema format with params', () => {
        const result = createPostRequestSchema(baseSchema, paramsSchema);
        expect(result).toMatchSnapshot();
    });
});
