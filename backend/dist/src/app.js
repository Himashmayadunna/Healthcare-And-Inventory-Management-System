"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./middleware/errorHandler");
const errors_1 = require("./utils/errors");
const app = (0, express_1.default)();
// Apply Global Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Swagger API Documentation Interface
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Root Healthcheck Checkpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'MediLex Healthcare & Inventory API Gateway is operational.',
        documentation: '/api-docs',
        environment: process.env.NODE_ENV || 'development',
    });
});
// Register API Resource Router
app.use('/api', routes_1.default);
// Catch-all route handler for non-existent endpoints (404)
app.use((req, res, next) => {
    next(new errors_1.NotFoundError(`Requested resource '${req.originalUrl}' not found.`));
});
// Centralized Error-Handling Middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
