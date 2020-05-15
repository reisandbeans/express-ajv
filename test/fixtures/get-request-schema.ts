import { RequestSchema } from '../../src';

export const getRequestSchema: RequestSchema = {
    type: 'object',
    required: ['query', 'params'],
    properties: {
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: {
                    type: 'string',
                    pattern: '[a-f0-9]{24}',
                },
            },
        },
        query: {
            type: 'object',
            required: ['name', 'age', 'city'],
            properties: {
                name: {
                    type: 'string',
                    minLength: 3,
                },
                age: {
                    type: 'number',
                    minimum: 0,
                },
                city: {
                    type: 'string',
                    enum: ['new-york', 'san-francisco'],
                },
            },
        },
    },
};
