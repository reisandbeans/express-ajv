import { asyncSchema } from './async-schema';
import { getRequestSchema } from './get-request-schema';
import { postRequestSchema } from './post-request-schema';
import { SchemaCollection } from '../../src';

export const schemas: SchemaCollection = {
    asyncSchema,
    getRequest: getRequestSchema,
    postRequest: postRequestSchema,
};
