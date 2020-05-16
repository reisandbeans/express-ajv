"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const request_validator_1 = require("./request-validator");
function createValidator(schemas, options) {
    if (!lodash_1.isObject(schemas)) {
        throw new Error('schemas should be an object');
    }
    const validator = new request_validator_1.RequestValidator(schemas, options);
    const validatorMiddleware = (schema) => validator.validateSchema(schema);
    return Object.assign(validatorMiddleware, { ajv: validator.ajv });
}
exports.createValidator = createValidator;
//# sourceMappingURL=create-validator.js.map