"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./src/app"));
const db_1 = require("./src/config/db");
// Load environmental variables
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || '5000', 10);
/**
 * Bootstrap and start the MediLex backend application.
 */
const bootstrap = async () => {
    try {
        console.log('Connecting to Microsoft SQL Server...');
        await (0, db_1.connectDB)();
        console.log('Successfully connected to Microsoft SQL Server.');
        app_1.default.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`  MediLex Backend is active in '${process.env.NODE_ENV || 'development'}'`);
            console.log(`  Port: http://localhost:${PORT}`);
            console.log(`  Swagger documentation: http://localhost:${PORT}/api-docs`);
            console.log(`=========================================`);
        });
    }
    catch (error) {
        console.error('Critical Failure: Database connection failed. Application will now exit.', error);
        process.exit(1);
    }
};
// Start the server
bootstrap();
