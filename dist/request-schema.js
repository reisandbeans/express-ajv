"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createSchema(querySchema, bodySchema, paramsSchema) {
    const schema = {
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
    return schema;
}
function createGetRequestSchema(querySchema, paramsSchema) {
    return createSchema(querySchema, undefined, paramsSchema);
}
exports.createGetRequestSchema = createGetRequestSchema;
function createPostRequestSchema(bodySchema, paramsSchema) {
    return createSchema(undefined, bodySchema, paramsSchema);
}
exports.createPostRequestSchema = createPostRequestSchema;
//# sourceMappingURL=request-schema.js.map