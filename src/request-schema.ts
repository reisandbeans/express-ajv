export function createGetRequestSchema(querySchema?: object, paramsSchema?: object) {
    const schema: { [key: string]: any } = {
        type: 'object',
        properties: {},
        required: [],
    };

    if (querySchema) {
        schema.required.push('query');
        schema.properties['query'] = querySchema;
    }

    if (paramsSchema) {
        schema.required.push('params');
        schema.properties['params'] = paramsSchema;
    }

    return schema;
}
