import { Router, Request, Response, NextFunction } from 'express';
import { getPool } from '../config/db';

const router = Router();

/**
 * Health check route to verify live database connectivity.
 * Executes: SELECT GETDATE() AS CurrentTime
 */
router.get('/health', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pool = getPool();
    const result = await pool.request().query('SELECT GETDATE() AS CurrentTime');
    const currentTime = result.recordset[0].CurrentTime;

    res.status(200).json({
      success: true,
      database: 'connected',
      serverTime: currentTime,
      message: 'Database Connected Successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
