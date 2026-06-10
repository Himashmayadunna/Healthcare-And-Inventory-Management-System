import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './routes';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { NotFoundError } from './utils/errors';

const app = express();

// Apply Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation Interface
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Healthcheck Checkpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'MediLex Healthcare & Inventory API Gateway is operational.',
    documentation: '/api-docs',
    environment: process.env.NODE_ENV || 'development',
  });
});

// Register API Resource Router
app.use('/api', apiRouter);

// Catch-all route handler for non-existent endpoints (404)
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Requested resource '${req.originalUrl}' not found.`));
});

// Centralized Error-Handling Middleware
app.use(errorHandler);

export default app;
