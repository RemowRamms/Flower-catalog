/* eslint-disable no-console */
import express from 'express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import logger from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as routes from './routes';
import { enhance } from '@zenstackhq/runtime';
import { PrismaClient } from '@prisma/client';
import { ZenStackMiddleware } from '@zenstackhq/server/express';
import { RestApiHandler } from '@zenstackhq/server/api';

const prisma = new PrismaClient();

// Load OpenAPI specification from src folder
const openapiSpec = JSON.parse(readFileSync(join(__dirname, 'openapi.json'), 'utf-8'));

const REST_API = express.Router();

REST_API.use(express.json());
REST_API.use(cors());

REST_API.use(
    '/api/v2',
    ZenStackMiddleware({
        getPrisma: (request) => enhance(prisma),
        handler: RestApiHandler({
            endpoint: process.env.API_ENDPOINT || 'http://localhost:3001/api/v2'
        }),
    })
);

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(compression());

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'Flower Catalog API',
    customCss: '.swagger-ui .topbar { display: none }',
}));

// Mount REST API
app.use(REST_API);

// Legacy routes
app.use('/api', routes.hello);
app.use('/api/users', routes.users);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Flower Catalog API',
        documentation: '/api-docs',
        api: '/api/v2'
    });
});

module.exports = app;
