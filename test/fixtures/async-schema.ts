import { RequestSchema } from '../../src';

export const asyncSchema: RequestSchema = {
    $async: true,
    type: 'object',
    required: ['query', 'params'],
    properties: {
        query: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    minLength: 3,
                },
            },
        },
    },
};
