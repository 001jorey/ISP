import express, { Request, Response } from 'express';
import { db } from '../database/db';
import smsService from '../services/smsService';
import mikrotikService from '../services/mikrotikService';

const router = express.Router();

// 1. Get all active internet packages
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await db.plan.findMany();
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// 2. Request Package Connection & Instant 10-Min Grace Period Activation (Hotspot or PPPoE)
router.post('/request-activation', async (req: Request, res: Response) => {
  try {
    const { 
      fullName, 
      phone, 
      location, 
      connectionType = 'HOTSPOT', 
      planId, 
      macAddress: reqMac, 
      ipAddress: reqIp 
    } = req.body;

    if (!phone || !planId) {
      return res.status(400).json({ success: false, error: 'Phone number and Plan are required' });
    }

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Selected plan not found' });
    }

    // Find or create customer
    let user = await db.user.findFirst({ where: { phone } });
    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          firstName: fullName?.split(' ')[0] || 'Customer',
          lastName: fullName?.split(' ')[1] || '',
          location: location || 'Hotspot Zone',
          role: 'CUSTOMER'
        }
      });
    }

    const sessionToken = 'kj_grace_' + Math.random().toString(36).substring(2, 10);
    const mac = reqMac || 'DC:A6:32:' + Math.floor(10 + Math.random() * 89) + ':89:FA';
    const ip = reqIp || '192.168.88.' + Math.floor(100 + Math.random() * 150);

    // Generate PPPoE credentials if PPPoE is chosen
    const pppoeUsername = connectionType === 'PPPOE' ? `${phone.replace(/\D/g, '')}@kijanilink` : null;
    const pppoePassword = connectionType === 'PPPOE' ? `pass${Math.floor(1000 + Math.random() * 9000)}` : null;

    // Create Activation Request with 10-Minute Grace Access
    const graceMinutes = 10;
    const graceExpiresAt = new Date(Date.now() + graceMinutes * 60 * 1000).toISOString();

    const activation = await db.activation.create({
      data: {
        userId: user.id,
        fullName: fullName || user.firstName || 'Hotspot Customer',
        phone,
        location: location || 'Hotspot Zone',
        connectionType: connectionType as any,
        pppoeUsername,
        pppoePassword,
        planId: plan.id,
        macAddress: mac,
        ipAddress: ip,
        status: 'PENDING_APPROVAL',
        gracePeriodMinutes: graceMinutes,
        graceExpiresAt,
        sessionToken
      }
    });

    // Provision temporary 10-min grace session
    await db.session.create({
      data: {
        userId: user.id,
        planId: plan.id,
        macAddress: mac,
        ipAddress: ip,
        endTime: graceExpiresAt,
        status: 'GRACE_PERIOD',
        sessionToken,
        isGracePeriod: true
      }
    });

    // Notify MikroTik RouterOS for temporary unblock
    await mikrotikService.createHotspotUser(sessionToken, sessionToken, 'grace_10min');

    // Send SMS alert to customer
    await smsService.sendSMS(
      phone,
      `KijaniLink: Your ${plan.name} request has been received! You have 10 mins instant grace internet access while admin approval is in progress.`
    );

    res.json({
      success: true,
      data: {
        requestId: activation.id,
        sessionToken,
        status: 'PENDING_APPROVAL',
        graceExpiresAt,
        gracePeriodMinutes: graceMinutes,
        planName: plan.name,
        speedLimit: plan.speedLimit,
        price: plan.price,
        connectionType,
        pppoeUsername,
        pppoePassword,
        message: '10-minute grace internet session activated. Awaiting admin approval for full package.'
      }
    });
  } catch (error) {
    console.error('Request activation error:', error);
    res.status(500).json({ success: false, error: 'Failed to request activation' });
  }
});

// 3. Poll Activation & Session Status
router.get('/activation-status/:requestId', async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const activation = await db.activation.findUnique({ where: { id: requestId } });

    if (!activation) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    const plan = await db.plan.findUnique({ where: { id: activation.planId } });

    const isGraceExpired = new Date() > new Date(activation.graceExpiresAt);

    res.json({
      success: true,
      data: {
        id: activation.id,
        status: activation.status,
        fullName: activation.fullName,
        phone: activation.phone,
        connectionType: activation.connectionType,
        pppoeUsername: activation.pppoeUsername,
        pppoePassword: activation.pppoePassword,
        graceExpiresAt: activation.graceExpiresAt,
        fullExpiresAt: activation.fullExpiresAt,
        approvedAt: activation.approvedAt,
        approvedBy: activation.approvedBy,
        isGraceExpired,
        sessionToken: activation.sessionToken,
        planName: plan?.name || 'High Speed Plan',
        speedLimit: plan?.speedLimit || '25 Mbps',
        duration: plan?.duration || 24,
        price: plan?.price || 150
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to check status' });
  }
});

// 4. Redeem Voucher
router.post('/voucher/redeem', async (req: Request, res: Response) => {
  try {
    const { code, phone } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Voucher code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await db.voucher.findUnique({ where: { code: cleanCode } });

    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Invalid voucher code.' });
    }

    if (voucher.isRedeemed) {
      return res.status(400).json({ success: false, error: 'This voucher has already been redeemed.' });
    }

    const plan = await db.plan.findUnique({ where: { id: voucher.planId } }) || (await db.plan.findMany())[0];

    await db.voucher.update({
      where: { code: cleanCode },
      data: { isRedeemed: true, redeemedAt: new Date().toISOString() }
    });

    const sessionToken = 'kj_vch_' + Math.random().toString(36).substring(2, 12);
    const endTime = new Date(Date.now() + plan.duration * 3600 * 1000).toISOString();

    await db.session.create({
      data: {
        userId: 'usr-vch',
        planId: plan.id,
        endTime,
        status: 'ACTIVE',
        sessionToken,
        isGracePeriod: false
      }
    });

    res.json({
      success: true,
      data: {
        message: 'Voucher redeemed successfully! Full package activated.',
        planName: plan.name,
        speedLimit: plan.speedLimit,
        duration: plan.duration,
        sessionToken,
        fullExpiresAt: endTime
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Voucher redemption failed' });
  }
});

// 5. Connect Session
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    const session = await db.session.findUnique({ where: { sessionToken } });

    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid session token' });
    }

    res.json({
      success: true,
      data: {
        message: 'Connected to KijaniLink Broadband',
        session: {
          id: session.id,
          plan: session.plan?.name || 'Kijani Package',
          speedLimit: session.plan?.speedLimit || '25 Mbps',
          endTime: session.endTime,
          isGracePeriod: session.isGracePeriod
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Connection check failed' });
  }
});

// 6. Network status
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      network: 'KijaniLink Ultra-Broadband WiFi & PPPoE',
      gateway: 'Online (10Gbps SEACOM Ring)',
      location: 'Nairobi Core Edge #04',
      latency: '11ms',
      activeHotspotUsers: 42
    }
  });
});

export default router;
