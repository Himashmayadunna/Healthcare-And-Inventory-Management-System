import dotenv from 'dotenv';
import app from './src/app';
import { connectDB } from './src/config/db';

// Load environmental variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

/**
 * Bootstrap and start the MediLex backend application.
 */
const bootstrap = async () => {
  try {
    console.log('Connecting to Microsoft SQL Server...');
    await connectDB();
    console.log('Successfully connected to Microsoft SQL Server.');

    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  MediLex Backend is active in '${process.env.NODE_ENV || 'development'}'`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  Swagger documentation: http://localhost:${PORT}/api-docs`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('Critical Failure: Database connection failed. Application will now exit.', error);
    process.exit(1);
  }
};

// Start the server
bootstrap();
