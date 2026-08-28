import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email?: string | null;
  phone: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN' | 'SUPPORT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  duration: number; // in hours
  dataLimit: string;
  speedLimit: string;
  isActive: boolean;
  badge?: string;
  isPopular?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  planId: string;
  macAddress?: string | null;
  ipAddress?: string | null;
  startTime: string;
  endTime?: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'GRACE_PERIOD';
  dataUsed: number;
  sessionToken: string;
  routerSessionId?: string | null;
  isGracePeriod?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User | null;
  plan?: Plan | null;
}

export interface ClientActivationRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  location: string;
  connectionType: 'HOTSPOT' | 'PPPOE';
  pppoeUsername?: string | null;
  pppoePassword?: string | null;
  planId: string;
  macAddress: string;
  ipAddress: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  gracePeriodMinutes: number;
  graceExpiresAt: string;
  sessionToken: string;
  approvedAt?: string | null;
  approvedBy?: string | null;
  fullExpiresAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  mpesaReceiptNumber?: string | null;
  checkoutRequestId?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Voucher {
  id: string;
  code: string;
  planId: string;
  userId?: string | null;
  amount: number;
  isRedeemed: boolean;
  redeemedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
}

interface DatabaseSchema {
  users: User[];
  plans: Plan[];
  sessions: Session[];
  activations: ClientActivationRequest[];
  payments: Payment[];
  vouchers: Voucher[];
  systemConfigs: SystemConfig[];
}

const DB_FILE = path.resolve(__dirname, '../../data/db.json');

class LocalDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    if (this.data.plans.length === 0 || this.data.users.length === 0 || !this.data.activations) {
      this.seedDefaults();
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.activations) parsed.activations = [];
        return parsed;
      }
    } catch (e) {
      console.error('Error reading DB_FILE, initializing fresh schema', e);
    }
    return {
      users: [],
      plans: [],
      sessions: [],
      activations: [],
      payments: [],
      vouchers: [],
      systemConfigs: []
    };
  }

  public save(): void {
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist DB_FILE:', e);
    }
  }

  public seedDefaults(): void {
    const defaultPasswordHash = bcrypt.hashSync('admin123', 10);
    const now = new Date().toISOString();

    const adminUser: User = {
      id: 'usr-admin-01',
      email: 'admin@kijanilink.com',
      phone: '+254700000001',
      password: defaultPasswordHash,
      firstName: 'Kijani',
      lastName: 'Admin',
      role: 'ADMIN',
      isActive: true,
      createdAt: now,
      updatedAt: now
    };

    const customer1: User = {
      id: 'usr-cust-01',
      email: 'mwangi@gmail.com',
      phone: '+254712345678',
      firstName: 'Mwangi',
      lastName: 'Kariuki',
      location: 'Block B, Apt 302',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updatedAt: now
    };

    const customer2: User = {
      id: 'usr-cust-02',
      email: 'chebet@yahoo.com',
      phone: '+254723456789',
      firstName: 'Faith',
      lastName: 'Chebet',
      location: 'Sunrise Plaza, Suite 4',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
      updatedAt: now
    };

    const customer3: User = {
      id: 'usr-cust-03',
      email: 'otieno@outlook.com',
      phone: '+254734567890',
      firstName: 'Brian',
      lastName: 'Otieno',
      location: 'Hostel 3, Room 12',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      updatedAt: now
    };

    const plans: Plan[] = [
      {
        id: 'plan-1hr',
        name: 'Turbo Pass (1 Hour)',
        description: 'Ultra-fast high-speed connection for quick tasks & video streaming',
        price: 20,
        duration: 1,
        dataLimit: '1.5GB',
        speedLimit: '15 Mbps',
        badge: '⚡ Quick Boost',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan-3hr',
        name: 'Power Session (3 Hours)',
        description: 'Ideal for remote meetings, YouTube & heavy downloads',
        price: 50,
        duration: 3,
        dataLimit: '5GB',
        speedLimit: '25 Mbps',
        badge: '🔥 Hot Pick',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan-24hr',
        name: '24-Hour Day Pass',
        description: 'Full day non-stop gaming, 4K streaming & unlimited downloads',
        price: 150,
        duration: 24,
        dataLimit: 'Unlimited',
        speedLimit: '35 Mbps',
        isPopular: true,
        badge: '👑 Best Value',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan-7day',
        name: 'Weekly Kijani Pro (7 Days)',
        description: 'High priority bandwidth with 24/7 dedicated stability',
        price: 750,
        duration: 168,
        dataLimit: 'Unlimited',
        speedLimit: '50 Mbps',
        badge: '🚀 Pro Tier',
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan-30day',
        name: 'Monthly Fiber Ultimate (30 Days)',
        description: 'Maximum speed tier with zero throttling and VIP support',
        price: 2500,
        duration: 720,
        dataLimit: 'Unlimited',
        speedLimit: '100 Mbps',
        badge: '💎 VIP Unlimited',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    const activations: ClientActivationRequest[] = [
      {
        id: 'act-001',
        userId: customer1.id,
        fullName: 'Mwangi Kariuki',
        phone: '+254712345678',
        location: 'Block B, Apt 302',
        connectionType: 'HOTSPOT',
        planId: plans[2].id,
        macAddress: 'DC:A6:32:89:12:FA',
        ipAddress: '192.168.88.145',
        status: 'PENDING_APPROVAL',
        gracePeriodMinutes: 10,
        graceExpiresAt: new Date(Date.now() + 1000 * 60 * 7).toISOString(),
        sessionToken: 'kj_grace_tok_mwangi_01',
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        updatedAt: now
      },
      {
        id: 'act-002',
        userId: customer2.id,
        fullName: 'Faith Chebet',
        phone: '+254723456789',
        location: 'Sunrise Plaza, Suite 4',
        connectionType: 'PPPOE',
        pppoeUsername: 'faith.chebet@kijani',
        pppoePassword: 'pass' + Math.floor(1000 + Math.random() * 9000),
        planId: plans[3].id,
        macAddress: 'A4:C3:F0:4B:92:11',
        ipAddress: '192.168.88.172',
        status: 'PENDING_APPROVAL',
        gracePeriodMinutes: 10,
        graceExpiresAt: new Date(Date.now() + 1000 * 60 * 8).toISOString(),
        sessionToken: 'kj_grace_tok_faith_02',
        createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        updatedAt: now
      }
    ];

    const sessions: Session[] = [
      {
        id: 'sess-001',
        userId: customer1.id,
        planId: plans[2].id,
        macAddress: 'DC:A6:32:89:12:FA',
        ipAddress: '192.168.88.145',
        startTime: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        endTime: new Date(Date.now() + 1000 * 60 * 7).toISOString(),
        status: 'GRACE_PERIOD',
        isGracePeriod: true,
        dataUsed: 145 * 1024 * 1024,
        sessionToken: 'kj_grace_tok_mwangi_01',
        routerSessionId: '*4F',
        createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
        updatedAt: now
      }
    ];

    const vouchers: Voucher[] = [
      {
        id: 'vch-001',
        code: 'KIJANI-9821-SPEED',
        planId: plans[0].id,
        amount: 20,
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
        createdAt: now
      }
    ];

    this.data.users = [adminUser, customer1, customer2, customer3];
    this.data.plans = plans;
    this.data.activations = activations;
    this.data.sessions = sessions;
    this.data.payments = [];
    this.data.vouchers = vouchers;
    this.save();
  }

  get user() {
    return {
      findUnique: async ({ where }: { where: { email?: string; phone?: string; id?: string } }): Promise<User | null> => {
        return this.data.users.find(u => {
          if (where.id && u.id === where.id) return true;
          if (where.email && u.email?.toLowerCase() === where.email.toLowerCase()) return true;
          if (where.phone && u.phone === where.phone) return true;
          return false;
        }) || null;
      },
      findFirst: async ({ where }: { where?: any }): Promise<User | null> => {
        if (!where) return this.data.users[0] || null;
        return this.data.users.find(u => {
          if (where.phone && u.phone === where.phone) return true;
          if (where.email && u.email === where.email) return true;
          return true;
        }) || null;
      },
      findMany: async (args?: any): Promise<User[]> => {
        let results = [...this.data.users];
        if (args?.where) {
          if (args.where.role) results = results.filter(u => u.role === args.where.role);
        }
        return results;
      },
      create: async ({ data }: { data: Partial<User> }): Promise<User> => {
        const id = 'usr-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newUser: User = {
          id,
          phone: data.phone!,
          email: data.email || null,
          password: data.password ? bcrypt.hashSync(data.password, 10) : null,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          location: data.location || null,
          role: (data.role as any) || 'CUSTOMER',
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        this.data.users.unshift(newUser);
        this.save();
        return newUser;
      },
      update: async ({ where, data }: { where: { id?: string }; data: Partial<User> }): Promise<User> => {
        const idx = this.data.users.findIndex(u => u.id === where.id);
        if (idx === -1) throw new Error('User not found');
        this.data.users[idx] = { ...this.data.users[idx], ...data, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.users[idx];
      },
      count: async (args?: any): Promise<number> => {
        if (args?.where?.role) return this.data.users.filter(u => u.role === args.where.role).length;
        return this.data.users.length;
      }
    };
  }

  get activation() {
    return {
      findUnique: async ({ where }: { where: { id?: string; sessionToken?: string } }): Promise<ClientActivationRequest | null> => {
        const item = this.data.activations.find(a => {
          if (where.id && a.id === where.id) return true;
          if (where.sessionToken && a.sessionToken === where.sessionToken) return true;
          return false;
        });
        if (!item) return null;
        return {
          ...item,
          plan: this.data.plans.find(p => p.id === item.planId)
        };
      },
      findFirst: async ({ where }: { where?: any }): Promise<ClientActivationRequest | null> => {
        const item = this.data.activations.find(a => {
          if (where?.phone && a.phone === where.phone) return true;
          if (where?.sessionToken && a.sessionToken === where.sessionToken) return true;
          if (where?.macAddress && a.macAddress === where.macAddress) return true;
          return false;
        });
        if (!item) return null;
        return {
          ...item,
          plan: this.data.plans.find(p => p.id === item.planId)
        };
      },
      findMany: async (args?: { where?: any; orderBy?: any }): Promise<ClientActivationRequest[]> => {
        let list = [...this.data.activations];
        if (args?.where) {
          if (args.where.status) list = list.filter(a => a.status === args.where.status);
          if (args.where.connectionType) list = list.filter(a => a.connectionType === args.where.connectionType);
        }
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list.map(item => ({
          ...item,
          plan: this.data.plans.find(p => p.id === item.planId)
        }));
      },
      create: async ({ data }: { data: Partial<ClientActivationRequest> }): Promise<ClientActivationRequest> => {
        const id = 'act-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const graceMins = data.gracePeriodMinutes || 10;
        const graceExpiresAt = new Date(Date.now() + graceMins * 60 * 1000).toISOString();

        const newActivation: ClientActivationRequest = {
          id,
          userId: data.userId || 'usr-guest',
          fullName: data.fullName || 'Hotspot Customer',
          phone: data.phone!,
          location: data.location || 'Hotspot Zone',
          connectionType: data.connectionType || 'HOTSPOT',
          pppoeUsername: data.pppoeUsername || null,
          pppoePassword: data.pppoePassword || null,
          planId: data.planId!,
          macAddress: data.macAddress || 'DC:A6:32:89:12:FA',
          ipAddress: data.ipAddress || '192.168.88.105',
          status: 'PENDING_APPROVAL',
          gracePeriodMinutes: graceMins,
          graceExpiresAt,
          sessionToken: data.sessionToken || ('kj_grace_' + Math.random().toString(36).substring(2, 10)),
          createdAt: now,
          updatedAt: now
        };

        this.data.activations.unshift(newActivation);
        this.save();
        return {
          ...newActivation,
          plan: this.data.plans.find(p => p.id === newActivation.planId)
        };
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<ClientActivationRequest> }): Promise<ClientActivationRequest> => {
        const idx = this.data.activations.findIndex(a => a.id === where.id);
        if (idx === -1) throw new Error('Activation request not found');
        this.data.activations[idx] = {
          ...this.data.activations[idx],
          ...data,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return {
          ...this.data.activations[idx],
          plan: this.data.plans.find(p => p.id === this.data.activations[idx].planId)
        };
      },
      count: async (args?: any): Promise<number> => {
        if (args?.where?.status) {
          return this.data.activations.filter(a => a.status === args.where.status).length;
        }
        return this.data.activations.length;
      }
    };
  }

  get plan() {
    return {
      findUnique: async ({ where }: { where: { id?: string; isActive?: boolean } }): Promise<Plan | null> => {
        return this.data.plans.find(p => p.id === where.id) || null;
      },
      findMany: async (args?: any): Promise<Plan[]> => {
        let results = [...this.data.plans];
        if (args?.where?.isActive !== undefined) {
          results = results.filter(p => p.isActive === args.where.isActive);
        }
        return results;
      },
      create: async ({ data }: { data: any }): Promise<Plan> => {
        const id = 'plan-' + Math.random().toString(36).substring(2, 8);
        const now = new Date().toISOString();
        const newPlan: Plan = {
          id,
          name: data.name,
          description: data.description || '',
          price: Number(data.price),
          duration: Number(data.duration),
          dataLimit: data.dataLimit || 'Unlimited',
          speedLimit: data.speedLimit || '20 Mbps',
          isActive: true,
          createdAt: now,
          updatedAt: now
        };
        this.data.plans.unshift(newPlan);
        this.save();
        return newPlan;
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Plan> }): Promise<Plan> => {
        const idx = this.data.plans.findIndex(p => p.id === where.id);
        if (idx === -1) throw new Error('Plan not found');
        this.data.plans[idx] = { ...this.data.plans[idx], ...data, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.plans[idx];
      },
      delete: async ({ where }: { where: { id: string } }) => {
        this.data.plans = this.data.plans.filter(p => p.id !== where.id);
        this.save();
      },
      count: async () => this.data.plans.length
    };
  }

  get session() {
    return {
      findUnique: async ({ where }: { where: { id?: string; sessionToken?: string }; include?: any }): Promise<any | null> => {
        const item = this.data.sessions.find(s => {
          if (where.id && s.id === where.id) return true;
          if (where.sessionToken && s.sessionToken === where.sessionToken) return true;
          return false;
        });
        if (!item) return null;
        return {
          ...item,
          user: this.data.users.find(u => u.id === item.userId),
          plan: this.data.plans.find(p => p.id === item.planId)
        };
      },
      findMany: async (args?: any): Promise<any[]> => {
        return this.data.sessions.map(s => ({
          ...s,
          user: this.data.users.find(u => u.id === s.userId),
          plan: this.data.plans.find(p => p.id === s.planId)
        }));
      },
      create: async ({ data }: { data: any; include?: any }): Promise<Session> => {
        const id = 'sess-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newSession: Session = {
          id,
          userId: data.userId,
          planId: data.planId,
          macAddress: data.macAddress || 'DC:A6:32:89:12:FA',
          ipAddress: data.ipAddress || '192.168.88.105',
          startTime: now,
          endTime: data.endTime || null,
          status: data.status || 'ACTIVE',
          dataUsed: 0,
          sessionToken: data.sessionToken,
          isGracePeriod: data.isGracePeriod || false,
          createdAt: now,
          updatedAt: now
        };
        this.data.sessions.unshift(newSession);
        this.save();
        return newSession;
      },
      update: async ({ where, data }: { where: { id?: string; sessionToken?: string }; data: Partial<Session> }): Promise<Session> => {
        const idx = this.data.sessions.findIndex(s => {
          if (where.id && s.id === where.id) return true;
          if (where.sessionToken && s.sessionToken === where.sessionToken) return true;
          return false;
        });
        if (idx === -1) throw new Error('Session not found');
        this.data.sessions[idx] = { ...this.data.sessions[idx], ...data, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.sessions[idx];
      },
      count: async (args?: any): Promise<number> => {
        if (args?.where?.status) return this.data.sessions.filter(s => s.status === args.where.status).length;
        return this.data.sessions.length;
      }
    };
  }

  get payment() {
    return {
      findUnique: async ({ where }: { where: { id?: string; checkoutRequestId?: string } }): Promise<Payment | null> => {
        return this.data.payments.find(p => {
          if (where.id && p.id === where.id) return true;
          if (where.checkoutRequestId && p.checkoutRequestId === where.checkoutRequestId) return true;
          return false;
        }) || null;
      },
      findMany: async (args?: any): Promise<Payment[]> => this.data.payments,
      create: async ({ data }: { data: any }): Promise<Payment> => {
        const id = 'pay-' + Math.random().toString(36).substring(2, 9);
        const newPayment: Payment = {
          id,
          userId: data.userId,
          planId: data.planId,
          amount: data.amount,
          status: 'COMPLETED',
          paymentMethod: data.paymentMethod || 'ADMIN_ACTIVATION',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.data.payments.unshift(newPayment);
        this.save();
        return newPayment;
      },
      update: async ({ where, data }: { where: { id?: string; checkoutRequestId?: string }; data: Partial<Payment> }): Promise<Payment> => {
        const idx = this.data.payments.findIndex(p => {
          if (where.id && p.id === where.id) return true;
          if (where.checkoutRequestId && p.checkoutRequestId === where.checkoutRequestId) return true;
          return false;
        });
        if (idx === -1) throw new Error('Payment not found');
        this.data.payments[idx] = { ...this.data.payments[idx], ...data, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.payments[idx];
      },
      count: async (): Promise<number> => this.data.payments.length
    };
  }

  get voucher() {
    return {
      findUnique: async ({ where }: { where: { code?: string } }): Promise<Voucher | null> => {
        return this.data.vouchers.find(v => v.code === where.code) || null;
      },
      findMany: async (): Promise<Voucher[]> => this.data.vouchers,
      create: async ({ data }: { data: any }): Promise<Voucher> => {
        const id = 'vch-' + Math.random().toString(36).substring(2, 9);
        const newVoucher: Voucher = {
          id,
          code: data.code,
          planId: data.planId,
          amount: data.amount,
          isRedeemed: false,
          expiresAt: data.expiresAt || new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
          createdAt: new Date().toISOString()
        };
        this.data.vouchers.unshift(newVoucher);
        this.save();
        return newVoucher;
      },
      update: async ({ where, data }: { where: { code?: string }; data: Partial<Voucher> }): Promise<Voucher> => {
        const idx = this.data.vouchers.findIndex(v => v.code === where.code);
        if (idx === -1) throw new Error('Voucher not found');
        this.data.vouchers[idx] = { ...this.data.vouchers[idx], ...data };
        this.save();
        return this.data.vouchers[idx];
      }
    };
  }
}

export const db = new LocalDB();
