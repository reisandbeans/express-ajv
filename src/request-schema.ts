import { RequestSchema } from './types';

function createSchema(querySchema?: object, bodySchema?: object, paramsSchema?: object) {
    const schema: { [key: string]: any } = {
        type: 'object',
        properties: {},
        required: [],
    };

    if (querySchema) {
        schema.required.push('query');
        schema.properties['query'] = querySchema;
    }

    if (bodySchema) {
        schema.required.push('body');
        schema.properties['body'] = bodySchema;
    }

    if (paramsSchema) {
        schema.required.push('params');
        schema.properties['params'] = paramsSchema;
    }

    return schema as RequestSchema;
}

export function createGetRequestSchema(querySchema: object, paramsSchema?: object) {
    return createSchema(querySchema, undefined, paramsSchema);
}

export function createPostRequestSchema(bodySchema: object, paramsSchema?: object) {
    return createSchema(undefined, bodySchema, paramsSchema);
}
