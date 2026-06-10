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
    console.log('Initializing database connection pool...');
    await connectDB();
  } catch (error) {
    console.warn('======================================================================');
    console.warn('  WARNING: Could not establish connection to Microsoft SQL Server.');
    console.warn('  API queries will fail until a valid SQL Server is running and configured.');
    console.warn('  Please check and update the database settings in your backend/.env file.');
    console.warn('======================================================================');
  }

  try {
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`  MediLex Backend is active in '${process.env.NODE_ENV || 'development'}'`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  Swagger documentation: http://localhost:${PORT}/api-docs`);
      console.log(`=========================================`);
    });
  } catch (listenError) {
    console.error('Critical Failure: Express listener failed to start.', listenError);
    process.exit(1);
  }
};

// Start the server
bootstrap();
