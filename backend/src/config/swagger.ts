import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediLex Healthcare & Inventory Management API',
      version: '1.0.0',
      description: 'REST APIs for the MediLex System using Express.js, TypeScript, Microsoft SQL Server, and JWT Authentication.',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token below (e.g. Bearer <token>)',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './dist/src/routes/*.js', './backend/src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
