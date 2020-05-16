import { RequestSchema } from './types';
export declare function createGetRequestSchema(querySchema: object, paramsSchema?: object): RequestSchema;
export declare function createPostRequestSchema(bodySchema: object, paramsSchema?: object): RequestSchema;
