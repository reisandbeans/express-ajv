# express-ajv

Middleware function for using [ajv](https://ajv.js.org/keywords.html) to validate [express](https://expressjs.com/) requests.

Validating requests using `express-ajv` will not only remove validation logic from your controller, but will also let you leverage the power of json schemas to write very complex validators in very little time.

## Installation

```
npm install express-ajv
```

Notice that this library relies on `ajv` as a peer dependency.

## Usage

```
import express from 'express';
import { createValidator } from 'express-ajv';

const schemas = {
    getUsersSchema: { ... } // your schema here
};
const validate = createValidator(schemas);
const app = express();

app.get('/users', validate('getUsersSchema'), (req, res) => ... );
```

Whenever your endpoint is consumed, the `validate` middleware will validate the properties `body`, `params` and `query` from `express` requests against your schemas, using the schema identified by the provided string. If the validation fails, an error will be generated and passed to express `next` function.

## API

The main function exposed by the library is `createValidator` which is the method that will create the middleware validator function to be used by your express app. `createValidator` takes two parameters:

- `schemas: SchemaCollection` - an object representing a collection of schemas. The keys in this object will should be used as the schema name provided to the middleware like shown in the snippet above.
- `options: ValidatorOptions` - optional object with configs to be used by the library. Available options are:
    - `ajv: Ajv` - an existing instance of `ajv`. If not provided, a new instance will be created. Default: `undefined`
    - `ajvOptions: Ajv.Options` - options to be provided to `ajv` if a new instance is to be created. Will be ignored if `options.ajv` is provided. Default: `undefined`
    - `errorFormatter: (error?: any) => any` - function to format errors return by `ajv` in case validation fails. Will be used before passing the error to `express` error handler. Default: `noop`
    - `contextExtractor: (req: Request) => any` - function to extract properties from the request and use as additional context to custom `ajv` validators.

The middleware returned by `createValidator` should be used as follows:

```
const validate = createValidator(schemas, options);

...

app.get('/', validate('YOUR_SCHEMA_KEY'), (req, res) => ... );
```

where 'YOUR_SCHEMA_KEY' should be one of the keys of the `schemas` object provided to `createValidator`. Finally, the middleware function returned by `createValidator` will have a property called `ajv` containing the `ajv` instance used for validations:

```
const options = {
    ajv: new Ajv(ajvOptions);
}
const validate = createValidator(schemas, options);

// validate.ajv === options.ajv
```

or

```
const validate = createValidator(schemas);

// validate.ajv will be a new Ajv instance
```

## Using the middleware to alter the properties in the request

Using the right configuration in `ajv` allows the user to leverage the validation functions to change the data being validated (see the [filtering data](https://github.com/ajv-validator/ajv#filtering-data), [assigning defaults](https://github.com/ajv-validator/ajv#assigning-defaults) and [coercing types](https://github.com/ajv-validator/ajv#assigning-defaults) for details and examples). Note that providing those options will change the original data in the request, for example:


Doing something like `curl -H "Content-Type: application/json" -X GET http://localhost:8080/users?age=10` would likely cause `age` to be parsed by `express` as a string. However if you use:

```
// schema
{
    "properties": {
        "query": {
            "properties": {
                "age": {
                    "minimum": 0,
                    "type": "number"
                }
            },
            "required": ["name"],
            "type": "object"
        }
    },
    "type": "object"
}

// validator
const options = {
    ajvOptions: {
        coerceTypes: true
    }
};
const validate = createValidator(schemas, options);

app.get('/', validate('YOUR_SCHEMA_KEY'), (req, res) => {
    // req.query.age will be cast to a number
});
```

This functionality can be used to, among other things, provide standardization and sanitization to your api requests.


## Considerations about schemas

Like mentioned above the middleware will validate the properties `body`, `params` and `query` from `express` requests against your schemas. Because of that, your schemas must follow a format similar to the example below:

```
// my-schema.json. Example for a typical GET request
{
    "properties": {
        "query": {
            "properties": {
                "name": {
                    "minLength": 3,
                    "type": "string"
                },
                "age": {
                    "minimum": 0,
                    "type": "number"
                }
            },
            "required": ["name"],
            "type": "object"
        },
        "params": {
            "properties": {
                "userId": {
                    "type": "string",
                    "pattern": "[a-f0-9]{24}"
                }
            },
            "required": ["userId"],
            "type": "object"
        }
    },
    "required": ["query", "params"],
    "type": "object"
}
```

Given that can be a little tedious declaring the base schema properties

```
{
    "properties": {
        "query": {
            ...
        },
        "params": {
            ...
        }
    },
    "required": ["query", "params"],
    "type": "object"
}
```

on every schema, the library exposes two helper functions `createGetRequestSchema` and `createPostRequestSchema`. Both functions follow the signature below:

`(baseSchema: object, baseParamsSchema?: object) => RequestSchema`

The objects you provide as the base schemas will be used as the schemas for `query` (or `body`) and `params`

## Examples

Examples can be found [here](./test/e2e/request-validator.e2e.spec.ts).