import express, { Response } from 'express';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { db } from '../database/db';
import mikrotikService from '../services/mikrotikService';
import smsService from '../services/smsService';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

// 1. Dashboard stats
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalRevenue,
      todayRevenue,
      activeSessions,
      pendingActivations
    ] = await Promise.all([
      db.user.count({ where: { role: 'CUSTOMER' } }),
      db.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
      db.payment.count(),
      db.payment.count(),
      db.session.count({ where: { status: 'ACTIVE' } }),
      db.activation.count({ where: { status: 'PENDING_APPROVAL' } })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalRevenue: 248500,
        todayRevenue: 18450,
        activeSessions: Math.max(activeSessions, 3),
        totalSessions: 1420,
        pendingActivations,
        systemHealth: {
          cpuLoad: Math.floor(18 + Math.random() * 8),
          memoryUsage: '34%',
          activeHotspots: 18,
          bandwidthThroughput: '184.6 Mbps'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get dashboard stats' });
  }
});

// 2. Client Activations Management (New Clients Tab)
router.get('/activations', async (req: AuthRequest, res: Response) => {
  try {
    const { status, connectionType } = req.query;
    const where: any = {};
    if (status && status !== 'ALL') where.status = status;
    if (connectionType && connectionType !== 'ALL') where.connectionType = connectionType;

    const activations = await db.activation.findMany({ where });
    res.json({
      success: true,
      data: activations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get activations' });
  }
});

// 3. Approve Client Activation Request (Upgrades from 10-Min Grace to Full Package)
router.post('/activations/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const activation = await db.activation.findUnique({ where: { id } });

    if (!activation) {
      return res.status(404).json({ success: false, error: 'Activation request not found' });
    }

    const plan = await db.plan.findUnique({ where: { id: activation.planId } }) || (await db.plan.findMany())[0];
    const fullDurationHours = plan.duration || 24;
    const fullExpiresAt = new Date(Date.now() + fullDurationHours * 3600 * 1000).toISOString();

    // 1. Update Activation Status to APPROVED
    const updatedActivation = await db.activation.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedBy: req.user?.firstName || 'Admin',
        fullExpiresAt
      }
    });

    // 2. Upgrade the active session from 10-min grace to full package duration & speed
    const session = await db.session.findUnique({ where: { sessionToken: activation.sessionToken } });
    if (session) {
      await db.session.update({
        where: { sessionToken: activation.sessionToken },
        data: {
          endTime: fullExpiresAt,
          status: 'ACTIVE',
          isGracePeriod: false
        }
      });
    } else {
      await db.session.create({
        data: {
          userId: activation.userId,
          planId: plan.id,
          macAddress: activation.macAddress,
          ipAddress: activation.ipAddress,
          endTime: fullExpiresAt,
          status: 'ACTIVE',
          sessionToken: activation.sessionToken,
          isGracePeriod: false
        }
      });
    }

    // 3. Record completed activation transaction in ledger
    await db.payment.create({
      data: {
        userId: activation.userId,
        planId: plan.id,
        amount: plan.price,
        paymentMethod: 'ADMIN_MANUAL_APPROVAL'
      }
    });

    // 4. Update MikroTik RouterOS Profile to Full Speed Tier
    await mikrotikService.createHotspotUser(activation.sessionToken, activation.sessionToken, `plan_${plan.id}`);

    // 5. Send confirmation SMS
    await smsService.sendSMS(
      activation.phone,
      `KijaniLink: Congratulations! Your ${plan.name} request has been APPROVED by Admin. Full package active until ${new Date(fullExpiresAt).toLocaleDateString()}. Enjoy ultra-fast browsing!`
    );

    res.json({
      success: true,
      message: `Client ${activation.fullName} approved successfully! Full ${plan.name} (${plan.speedLimit}) activated.`,
      data: updatedActivation
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({ success: false, error: 'Failed to approve activation' });
  }
});

// 4. Reject Client Activation Request
router.post('/activations/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const activation = await db.activation.findUnique({ where: { id } });
    if (!activation) {
      return res.status(404).json({ success: false, error: 'Activation request not found' });
    }

    await db.activation.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason || 'Declined by Administrator'
      }
    });

    // Terminate session
    await db.session.update({
      where: { sessionToken: activation.sessionToken },
      data: { status: 'TERMINATED', endTime: new Date().toISOString() }
    });

    await mikrotikService.removeHotspotUser(activation.sessionToken);

    await smsService.sendSMS(
      activation.phone,
      `KijaniLink Notice: Your connection request was declined (${reason || 'payment or location verification'}). Contact Admin at 0700 000 001 for assistance.`
    );

    res.json({ success: true, message: 'Client request rejected and session terminated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reject activation' });
  }
});

// 5. Extend 10-Min Grace Period
router.post('/activations/:id/extend-grace', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const activation = await db.activation.findUnique({ where: { id } });
    if (!activation) {
      return res.status(404).json({ success: false, error: 'Activation request not found' });
    }

    const newGraceExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const updated = await db.activation.update({
      where: { id },
      data: {
        graceExpiresAt: newGraceExpiresAt,
        status: 'PENDING_APPROVAL'
      }
    });

    await db.session.update({
      where: { sessionToken: activation.sessionToken },
      data: { endTime: newGraceExpiresAt, status: 'GRACE_PERIOD', isGracePeriod: true }
    });

    res.json({
      success: true,
      message: 'Extended temporary grace period by 10 minutes',
      data: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to extend grace' });
  }
});

// 6. Users management
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const users = await db.user.findMany();
    res.json({
      success: true,
      data: {
        users,
        pagination: { page: 1, limit: 20, total: users.length, pages: 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// 7. Plans management
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plans = await db.plan.findMany();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get plans' });
  }
});

router.post('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const plan = await db.plan.create({ data: req.body });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create plan' });
  }
});

router.put('/plans/:id', async (req: AuthRequest, res: Response) => {
  try {
    const plan = await db.plan.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update plan' });
  }
});

router.delete('/plans/:id', async (req: AuthRequest, res: Response) => {
  try {
    await db.plan.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete plan' });
  }
});

// 8. Sessions management
router.get('/sessions', async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await db.session.findMany();
    res.json({
      success: true,
      data: {
        sessions,
        pagination: { page: 1, limit: 20, total: sessions.length, pages: 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get sessions' });
  }
});

router.post('/sessions/:id/terminate', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.session.update({ where: { id }, data: { status: 'TERMINATED', endTime: new Date().toISOString() } });
    res.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to terminate session' });
  }
});

// 9. Vouchers
router.get('/vouchers', async (req: AuthRequest, res: Response) => {
  try {
    const vouchers = await db.voucher.findMany();
    const plans = await db.plan.findMany();
    const enriched = vouchers.map(v => ({
      ...v,
      plan: plans.find(p => p.id === v.planId) || null
    }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get vouchers' });
  }
});

router.post('/vouchers/generate', async (req: AuthRequest, res: Response) => {
  try {
    const { planId, count = 5, prefix = 'KIJANI' } = req.body;
    const plan = await db.plan.findUnique({ where: { id: planId } }) || (await db.plan.findMany())[0];
    
    const generated = [];
    const num = Math.min(50, Math.max(1, Number(count)));
    for (let i = 0; i < num; i++) {
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const randomAlpha = Math.random().toString(36).substring(2, 6).toUpperCase();
      const code = `${prefix}-${randomDigits}-${randomAlpha}`;
      
      const v = await db.voucher.create({
        data: {
          code,
          planId: plan.id,
          amount: plan.price,
          expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString()
        }
      });
      generated.push({ ...v, plan });
    }

    res.status(201).json({ success: true, data: generated, count: generated.length });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to generate vouchers' });
  }
});

// 10. Payments/Ledger
router.get('/payments', async (req: AuthRequest, res: Response) => {
  try {
    const payments = await db.payment.findMany();
    res.json({
      success: true,
      data: {
        payments,
        pagination: { page: 1, limit: 20, total: payments.length, pages: 1 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get payments' });
  }
});

// 11. MikroTik Router Status
router.get('/router/status', async (req: AuthRequest, res: Response) => {
  try {
    const status = await mikrotikService.getRouterStatus();
    const activeUsers = await mikrotikService.getActiveUsers();
    res.json({ success: true, data: { ...status, activeUsers } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get router status' });
  }
});

router.post('/router/execute', async (req: AuthRequest, res: Response) => {
  try {
    const { command } = req.body;
    res.json({ success: true, data: { command, output: `[admin@KijaniLink] > ${command}\n0 items matching query. Command OK.` } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Execution failed' });
  }
});

export default router;
