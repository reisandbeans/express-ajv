"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const ajv_1 = __importDefault(require("ajv"));
class RequestValidator {
    constructor(schemas, options) {
        var _a, _b, _c;
        this.validators = {};
        this.ajv = (_a = options === null || options === void 0 ? void 0 : options.ajv) !== null && _a !== void 0 ? _a : new ajv_1.default(options === null || options === void 0 ? void 0 : options.ajvOptions);
        this.errorFormatter = (_b = options === null || options === void 0 ? void 0 : options.errorFormatter) !== null && _b !== void 0 ? _b : this.defaultErrorFormatter;
        this.contextExtractor = (_c = options === null || options === void 0 ? void 0 : options.contextExtractor) !== null && _c !== void 0 ? _c : this.defaultValidationContext;
        this.registerSchemas(schemas);
    }
    registerSchemas(schemaCollection) {
        lodash_1.forOwn(schemaCollection, (schema, schemaName) => {
            const validator = this.ajv.compile(schema);
            this.validators[schemaName] = validator;
        });
    }
    getValidatorForSchema(schemaName) {
        if (!schemaName) {
            throw new Error('Please provide the schema name');
        }
        const validator = this.validators[schemaName];
        if (!validator) {
            throw new Error(`Validator for schema with name ${schemaName} not found`);
        }
        return validator;
    }
    defaultErrorFormatter(error) {
        return error;
    }
    defaultValidationContext(req) {
        return {};
    }
    validateSchema(schemaName) {
        const validator = this.getValidatorForSchema(schemaName);
        const middleware = (req, res, next) => {
            const contextParams = this.contextExtractor(req);
            const context = Object.assign({}, this.ajv, contextParams);
            const dataToValidate = lodash_1.pick(req, ['body', 'params', 'query']);
            return this.validate(dataToValidate, validator, context)
                .then(() => next())
                .catch((error) => {
                const formattedError = this.errorFormatter(error);
                next(formattedError);
            });
        };
        return middleware;
    }
    validate(data, validator, context) {
        return validator.$async
            ? this.validateAsync(data, validator, context)
            : this.validateSync(data, validator, context);
    }
    validateSync(data, validator, context) {
        const valid = validator.call(context, data);
        return valid
            ? Promise.resolve()
            : Promise.reject(new ajv_1.default.ValidationError(validator.errors));
    }
    validateAsync(data, validator, context) {
        return validator.call(context, data);
    }
}
exports.RequestValidator = RequestValidator;
//# sourceMappingURL=request-validator.js.map