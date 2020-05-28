import http from 'http';
import bodyParser from 'body-parser';
import express, { Application, NextFunction, Request, Response } from 'express';
import { merge, pick } from 'lodash';
import supertest from 'supertest';
import { createValidator, ValidatorOptions } from '../../src';
import { schemas } from '../fixtures/schemas';

describe('request-validator.e2e-spec.ts', () => {
    let app: Application;
    let server: http.Server;

    const port = 8080;
    const defaultOptions: ValidatorOptions = {
        ajvOptions: {
            allErrors: true,
            format: 'full',
        },
    };
    const badData = {
        name: 'Be',
        age: -1,
    };
    const validData = {
        name: 'Bernardo',
        age: 94,
        city: 'new-york',
    };

    afterEach(() => {
        return new Promise((resolve) => {
            server.close(resolve);
        });
    });

    function errorFormatter(error?: any) {
        const details = error.errors.map((validationError: any) => ({
            field: validationError.dataPath,
            message: validationError.message,
        }));
        const formattedError = {
            details,
            message: `Original error message: ${error.message}`,
        };
        return formattedError;
    }

    function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
        const error = pick(err, ['message', 'errors', 'details']);
        res.status(400).send({ error });
    }

    function createExpressApp(options?: ValidatorOptions) {
        app = express();
        const mergedOptions = merge({}, defaultOptions, options);
        const validate = createValidator(schemas, mergedOptions);

        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.get('/test/:userId', validate('getRequest'), (req: Request, res: Response) => {
            res.status(200).send({ success: true });
        });

        app.post('/test/:userId', validate('postRequest'), (req: Request, res: Response) => {
            res.status(200).send({ success: true });
        });

        app.use('/', errorHandler);

        return new Promise((resolve) => {
            server = app.listen(port, resolve);
        });
    }

    async function testRequest(method: 'get' | 'post', url: string,  data: object) {
        const request = supertest(app)[method](url);
        if (method === 'get') {
            request.query(data);
        } else {
            request.send(data);
        }

        const response = await request;
        expect(response.body).toMatchSnapshot();

        return response;
    }

    async function testInvalidRequest(method: 'get' | 'post') {
        const url = '/test/1234';
        const response = await testRequest(method, url, badData);
        expect(response.status).toBe(400);
    }

    async function testValidRequest(method: 'get' | 'post') {
        const url = '/test/576871e16b01de9500a46269';
        const response = await testRequest(method, url, validData);
        expect(response.status).toBe(200);
    }

    describe('GET requests', () => {
        it('Should return an error if the request does not comply with the provided schema', async () => {
            await createExpressApp();
            await testInvalidRequest('get');
        });

        it('Should accept valid requests', async () => {
            await createExpressApp({ ajvOptions: { coerceTypes: true } });
            await testValidRequest('get');
        });
    });

    describe('POST requests', () => {
        it('Should return an error if the request does not comply with the provided schema', async () => {
            await createExpressApp();
            await testInvalidRequest('post');
        });

        it('Should accept valid requests', async () => {
            await createExpressApp();
            await testValidRequest('post');
        });
    });
});
