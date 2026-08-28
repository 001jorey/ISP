import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { db } from '../database/db';
import mpesaService from '../services/mpesaService';
import sessionService from '../services/sessionService';
import smsService from '../services/smsService';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kijanilink_super_secure_secret_key_2026';

// Get all active plans
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch plans' });
  }
});

// Register new user
router.post('/register', [
  body('phone').notEmpty().withMessage('Valid phone number required')
], async (req: Request, res: Response) => {
  try {
    const { phone, email, firstName, lastName } = req.body;

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this phone number or email already exists' 
      });
    }

    const user = await db.user.create({
      data: {
        phone,
        email: email || null,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'CUSTOMER'
      }
    });

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    await smsService.sendWelcomeMessage(phone, firstName);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login user
router.post('/login', [
  body('phone').notEmpty().withMessage('Valid phone number required')
], async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    let user = await db.user.findFirst({
      where: { phone }
    });

    if (!user) {
      // Auto register for seamless captive portal experience
      user = await db.user.create({
        data: {
          phone,
          role: 'CUSTOMER'
        }
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Initiate payment (STK Push)
router.post('/payment', [
  body('phone').notEmpty().withMessage('Valid phone number required'),
  body('planId').notEmpty().withMessage('Valid plan ID required')
], async (req: Request, res: Response) => {
  try {
    const { phone, planId, amount: requestedAmount } = req.body;

    let user = await db.user.findFirst({
      where: { phone }
    });

    if (!user) {
      user = await db.user.create({
        data: {
          phone,
          role: 'CUSTOMER'
        }
      });
    }

    const plan = await db.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({ success: false, error: 'Plan not found or inactive' });
    }

    const finalAmount = requestedAmount || plan.price;

    const payment = await db.payment.create({
      data: {
        userId: user.id,
        planId,
        amount: finalAmount,
        status: 'PENDING',
        paymentMethod: 'MPESA_STK'
      }
    });

    const stkResponse = await mpesaService.initiateSTKPush({
      phone,
      amount: finalAmount,
      accountReference: `KIJANI-${payment.id.slice(-6).toUpperCase()}`,
      transactionDesc: `KijaniLink WiFi: ${plan.name}`
    });

    await db.payment.update({
      where: { id: payment.id },
      data: {
        checkoutRequestId: stkResponse.CheckoutRequestID
      }
    });

    res.json({
      success: true,
      data: {
        paymentId: payment.id,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        customerMessage: stkResponse.CustomerMessage,
        amount: finalAmount,
        phone,
        planName: plan.name
      }
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ success: false, error: 'Payment initiation failed' });
  }
});

// Check payment status
router.get('/payment/status/:checkoutRequestId', async (req: Request, res: Response) => {
  try {
    const { checkoutRequestId } = req.params;

    const payment = await db.payment.findUnique({
      where: { checkoutRequestId },
      include: { user: true, plan: true }
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: 'Payment record not found' });
    }

    if (payment.status === 'COMPLETED') {
      let session = await db.session.findFirst({
        where: {
          userId: payment.userId,
          planId: payment.planId,
          status: 'ACTIVE'
        }
      });

      if (!session) {
        const sessionToken = 'kj_live_' + Math.random().toString(36).substring(2, 12);
        session = await sessionService.createSession(payment.userId, payment.planId, sessionToken);
      }

      return res.json({
        success: true,
        data: {
          status: 'completed',
          sessionToken: session.sessionToken,
          amount: payment.amount,
          receiptNumber: payment.mpesaReceiptNumber || 'KJL-CONFIRMED',
          plan: payment.plan
        }
      });
    }

    res.json({
      success: true,
      data: {
        status: payment.status.toLowerCase(),
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({ success: false, error: 'Failed to check payment status' });
  }
});

// Redeem Voucher Code
router.post('/voucher/redeem', async (req: Request, res: Response) => {
  try {
    const { code, phone } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Voucher code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const voucher = await db.voucher.findUnique({
      where: { code: cleanCode }
    });

    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Invalid voucher code. Please double check.' });
    }

    if (voucher.isRedeemed) {
      return res.status(400).json({ success: false, error: 'This voucher has already been redeemed.' });
    }

    if (new Date() > new Date(voucher.expiresAt)) {
      return res.status(400).json({ success: false, error: 'This voucher has expired.' });
    }

    let user = null;
    if (phone) {
      user = await db.user.findFirst({ where: { phone } });
      if (!user) {
        user = await db.user.create({ data: { phone, role: 'CUSTOMER' } });
      }
    } else {
      user = await db.user.findFirst({ where: { role: 'CUSTOMER' } });
    }

    const plan = await db.plan.findUnique({ where: { id: voucher.planId } }) || (await db.plan.findMany())[0];

    await db.voucher.update({
      where: { code: cleanCode },
      data: {
        isRedeemed: true,
        redeemedAt: new Date().toISOString(),
        userId: user?.id || null
      }
    });

    const sessionToken = 'kj_vch_' + Math.random().toString(36).substring(2, 12);
    const session = await sessionService.createSession(user?.id || 'usr-guest', plan.id, sessionToken);

    res.json({
      success: true,
      data: {
        message: 'Voucher redeemed successfully!',
        planName: plan.name,
        speedLimit: plan.speedLimit,
        duration: plan.duration,
        sessionToken: session.sessionToken
      }
    });
  } catch (error) {
    console.error('Voucher redeem error:', error);
    res.status(500).json({ success: false, error: 'Voucher redemption failed' });
  }
});

// Connect to internet (Captive Portal Login Action)
router.post('/connect', [
  body('sessionToken').notEmpty().withMessage('Session token required')
], async (req: Request, res: Response) => {
  try {
    const { sessionToken } = req.body;
    const session = await sessionService.getActiveSession(sessionToken);
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    }

    res.json({
      success: true,
      data: {
        message: 'Connected to KijaniLink High-Speed Network',
        session: {
          id: session.id,
          plan: session.plan?.name || 'High Speed Plan',
          speedLimit: session.plan?.speedLimit || '20 Mbps',
          ipAddress: session.ipAddress || '192.168.88.105',
          endTime: session.endTime
        }
      }
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({ success: false, error: 'Connection failed' });
  }
});

// Network status check
router.get('/status', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      network: 'KijaniLink Ultra-Broadband WiFi',
      gateway: 'Online (10Gbps Core Fiber Backbone)',
      location: 'Nairobi Metro Edge #04',
      latency: '12ms',
      dns: '1.1.1.1 / 8.8.8.8',
      activeHotspotUsers: 142
    }
  });
});

export default router;
