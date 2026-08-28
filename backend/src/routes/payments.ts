import express from 'express';
import { db } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get user payments
router.get('/my-history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const payments = await db.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch payment history' });
  }
});

export default router;
