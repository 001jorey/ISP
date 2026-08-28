import express from 'express';
import { db } from '../database/db';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import sessionService from '../services/sessionService';

const router = express.Router();

// Get active session for user
router.get('/my-session', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const sessions = await sessionService.getUserActiveSessions(req.user!.id);
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
});

// Terminate user's own session
router.post('/terminate/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    await sessionService.terminateSession(sessionId);
    res.json({ success: true, message: 'Session disconnected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to disconnect session' });
  }
});

export default router;
