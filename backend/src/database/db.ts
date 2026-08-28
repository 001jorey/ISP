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
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  dataUsed: number;
  sessionToken: string;
  routerSessionId?: string | null;
  createdAt: string;
  updatedAt: string;
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
  payments: Payment[];
  vouchers: Voucher[];
  systemConfigs: SystemConfig[];
}

const DB_FILE = path.resolve(__dirname, '../../data/db.json');

class LocalDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    if (this.data.plans.length === 0 || this.data.users.length === 0) {
      this.seedDefaults();
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error reading DB_FILE, initializing fresh schema', e);
    }
    return {
      users: [],
      plans: [],
      sessions: [],
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
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'plan-3hr',
        name: 'Power Session (3 Hours)',
        description: 'Ideal for remote meetings, Netflix series & heavy research',
        price: 50,
        duration: 3,
        dataLimit: '5GB',
        speedLimit: '25 Mbps',
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
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    const payments: Payment[] = [
      {
        id: 'pay-001',
        userId: customer1.id,
        planId: plans[2].id,
        amount: 150,
        mpesaReceiptNumber: 'SHK89XJ2Q7',
        checkoutRequestId: 'ws_CO_28082026_01',
        status: 'COMPLETED',
        paymentMethod: 'MPESA_STK',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'pay-002',
        userId: customer2.id,
        planId: plans[3].id,
        amount: 750,
        mpesaReceiptNumber: 'SHK90LM8P2',
        checkoutRequestId: 'ws_CO_28082026_02',
        status: 'COMPLETED',
        paymentMethod: 'MPESA_STK',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
      },
      {
        id: 'pay-003',
        userId: customer3.id,
        planId: plans[4].id,
        amount: 2500,
        mpesaReceiptNumber: 'SHK91ZZ4K9',
        checkoutRequestId: 'ws_CO_28082026_03',
        status: 'COMPLETED',
        paymentMethod: 'MPESA_STK',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'pay-004',
        userId: customer1.id,
        planId: plans[0].id,
        amount: 20,
        mpesaReceiptNumber: 'SHK92AA1B3',
        checkoutRequestId: 'ws_CO_28082026_04',
        status: 'COMPLETED',
        paymentMethod: 'MPESA_STK',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
      }
    ];

    const sessions: Session[] = [
      {
        id: 'sess-001',
        userId: customer1.id,
        planId: plans[0].id,
        macAddress: 'DC:A6:32:89:12:FA',
        ipAddress: '192.168.88.145',
        startTime: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        endTime: new Date(Date.now() + 1000 * 60 * 35).toISOString(),
        status: 'ACTIVE',
        dataUsed: 485 * 1024 * 1024,
        sessionToken: 'kj_live_tok_89a1f29',
        routerSessionId: '*4F',
        createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        updatedAt: now
      },
      {
        id: 'sess-002',
        userId: customer2.id,
        planId: plans[3].id,
        macAddress: 'A4:C3:F0:4B:92:11',
        ipAddress: '192.168.88.172',
        startTime: new Date(Date.now() - 3600000 * 8).toISOString(),
        endTime: new Date(Date.now() + 3600000 * 160).toISOString(),
        status: 'ACTIVE',
        dataUsed: 3820 * 1024 * 1024,
        sessionToken: 'kj_live_tok_11a8bc4',
        routerSessionId: '*5A',
        createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
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
      },
      {
        id: 'vch-002',
        code: 'KIJANI-5542-TURBO',
        planId: plans[1].id,
        amount: 50,
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
        createdAt: now
      },
      {
        id: 'vch-003',
        code: 'KIJANI-8812-ULTRA',
        planId: plans[2].id,
        amount: 150,
        isRedeemed: false,
        expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
        createdAt: now
      }
    ];

    this.data.users = [adminUser, customer1, customer2, customer3];
    this.data.plans = plans;
    this.data.payments = payments;
    this.data.sessions = sessions;
    this.data.vouchers = vouchers;
    this.save();
  }

  // Model accessors mimicking Prisma
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
          if (where.OR && Array.isArray(where.OR)) {
            return where.OR.some((cond: any) => {
              if (cond.phone && u.phone === cond.phone) return true;
              if (cond.email && u.email === cond.email) return true;
              return false;
            });
          }
          if (where.role && u.role !== where.role) return false;
          if (where.isActive !== undefined && u.isActive !== where.isActive) return false;
          if (where.phone && u.phone !== where.phone) return false;
          if (where.email && u.email !== where.email) return false;
          return true;
        }) || null;
      },
      findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any; include?: any; select?: any }): Promise<any[]> => {
        let results = [...this.data.users];
        if (args?.where) {
          const w = args.where;
          results = results.filter(u => {
            if (w.role && u.role !== w.role) return false;
            if (w.isActive !== undefined && u.isActive !== w.isActive) return false;
            if (w.OR && Array.isArray(w.OR)) {
              return w.OR.some((cond: any) => {
                const search = cond.phone?.contains || cond.email?.contains || cond.firstName?.contains || cond.lastName?.contains;
                if (!search) return true;
                const s = search.toLowerCase();
                return (
                  u.phone.toLowerCase().includes(s) ||
                  (u.email && u.email.toLowerCase().includes(s)) ||
                  (u.firstName && u.firstName.toLowerCase().includes(s)) ||
                  (u.lastName && u.lastName.toLowerCase().includes(s))
                );
              });
            }
            return true;
          });
        }
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        const skip = args?.skip || 0;
        const take = args?.take !== undefined ? args.take : results.length;
        const paginated = results.slice(skip, skip + take);

        return paginated.map(u => {
          const userObj: any = { ...u };
          if (args?.include?.sessions) {
            userObj.sessions = this.data.sessions.filter(s => s.userId === u.id && s.status === 'ACTIVE').slice(0, 1);
          }
          if (args?.include?._count) {
            userObj._count = {
              sessions: this.data.sessions.filter(s => s.userId === u.id).length,
              payments: this.data.payments.filter(p => p.userId === u.id).length
            };
          }
          if (args?.select) {
            const res: any = {};
            for (const k of Object.keys(args.select)) {
              if (args.select[k]) res[k] = userObj[k];
            }
            return res;
          }
          return userObj;
        });
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
          role: (data.role as any) || 'CUSTOMER',
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: now,
          updatedAt: now
        };
        this.data.users.unshift(newUser);
        this.save();
        return newUser;
      },
      upsert: async ({ where, create, update }: { where: { email?: string }; create: any; update: any }): Promise<User> => {
        const existing = await this.user.findUnique({ where });
        if (existing) {
          return this.user.update({ where: { id: existing.id }, data: update });
        }
        return this.user.create({ data: create });
      },
      update: async ({ where, data }: { where: { id?: string }; data: Partial<User> }): Promise<User> => {
        const idx = this.data.users.findIndex(u => u.id === where.id);
        if (idx === -1) throw new Error('User not found');
        this.data.users[idx] = {
          ...this.data.users[idx],
          ...data,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return this.data.users[idx];
      },
      count: async (args?: { where?: any }): Promise<number> => {
        if (!args?.where) return this.data.users.length;
        const w = args.where;
        return this.data.users.filter(u => {
          if (w.role && u.role !== w.role) return false;
          if (w.isActive !== undefined && u.isActive !== w.isActive) return false;
          return true;
        }).length;
      }
    };
  }

  get plan() {
    return {
      findUnique: async ({ where }: { where: { id?: string; isActive?: boolean } }): Promise<Plan | null> => {
        return this.data.plans.find(p => {
          if (where.id && p.id !== where.id) return false;
          if (where.isActive !== undefined && p.isActive !== where.isActive) return false;
          return true;
        }) || null;
      },
      findMany: async (args?: { where?: any; orderBy?: any; include?: any }): Promise<any[]> => {
        let results = [...this.data.plans];
        if (args?.where) {
          if (args.where.isActive !== undefined) {
            results = results.filter(p => p.isActive === args.where.isActive);
          }
        }
        if (args?.orderBy?.price === 'asc') {
          results.sort((a, b) => a.price - b.price);
        } else if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        return results.map(p => {
          const planObj: any = { ...p };
          if (args?.include?._count) {
            planObj._count = {
              sessions: this.data.sessions.filter(s => s.planId === p.id).length,
              payments: this.data.payments.filter(pm => pm.planId === p.id).length
            };
          }
          return planObj;
        });
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
          isActive: data.isActive !== undefined ? data.isActive : true,
          createdAt: now,
          updatedAt: now
        };
        this.data.plans.unshift(newPlan);
        this.save();
        return newPlan;
      },
      createMany: async ({ data }: { data: any[] }): Promise<{ count: number }> => {
        for (const item of data) {
          await this.plan.create({ data: item });
        }
        return { count: data.length };
      },
      update: async ({ where, data }: { where: { id: string }; data: Partial<Plan> }): Promise<Plan> => {
        const idx = this.data.plans.findIndex(p => p.id === where.id);
        if (idx === -1) throw new Error('Plan not found');
        this.data.plans[idx] = {
          ...this.data.plans[idx],
          ...data,
          price: data.price !== undefined ? Number(data.price) : this.data.plans[idx].price,
          duration: data.duration !== undefined ? Number(data.duration) : this.data.plans[idx].duration,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return this.data.plans[idx];
      },
      deleteMany: async (_args?: any) => {
        this.data.plans = [];
        this.save();
        return { count: 0 };
      },
      count: async (_args?: any): Promise<number> => {
        return this.data.plans.length;
      }
    };
  }

  get session() {
    return {
      findUnique: async ({ where, include }: { where: { id?: string; sessionToken?: string }; include?: any }): Promise<any | null> => {
        const item = this.data.sessions.find(s => {
          if (where.id && s.id === where.id) return true;
          if (where.sessionToken && s.sessionToken === where.sessionToken) return true;
          return false;
        });
        if (!item) return null;
        const res: any = { ...item };
        if (include?.user) res.user = this.data.users.find(u => u.id === item.userId);
        if (include?.plan) res.plan = this.data.plans.find(p => p.id === item.planId);
        return res;
      },
      findFirst: async ({ where, include }: { where?: any; include?: any }): Promise<any | null> => {
        if (!where) return this.data.sessions[0] || null;
        const item = this.data.sessions.find(s => {
          if (where.userId && s.userId !== where.userId) return false;
          if (where.planId && s.planId !== where.planId) return false;
          if (where.status && s.status !== where.status) return false;
          if (where.sessionToken && s.sessionToken !== where.sessionToken) return false;
          return true;
        });
        if (!item) return null;
        const res: any = { ...item };
        if (include?.user) res.user = this.data.users.find(u => u.id === item.userId);
        if (include?.plan) res.plan = this.data.plans.find(p => p.id === item.planId);
        return res;
      },
      findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any; include?: any }): Promise<any[]> => {
        let results = [...this.data.sessions];
        if (args?.where) {
          const w = args.where;
          results = results.filter(s => {
            if (w.status && s.status !== w.status) return false;
            if (w.userId && s.userId !== w.userId) return false;
            if (w.endTime?.lt && new Date(s.endTime || 0) >= new Date(w.endTime.lt)) return false;
            if (w.endTime?.gt && new Date(s.endTime || 0) <= new Date(w.endTime.gt)) return false;
            return true;
          });
        }
        if (args?.orderBy?.startTime === 'desc') {
          results.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
        const skip = args?.skip || 0;
        const take = args?.take !== undefined ? args.take : results.length;
        const sliced = results.slice(skip, skip + take);

        return sliced.map(s => {
          const obj: any = { ...s };
          if (args?.include?.user) {
            const u = this.data.users.find(usr => usr.id === s.userId);
            obj.user = u ? { phone: u.phone, firstName: u.firstName, lastName: u.lastName } : null;
          }
          if (args?.include?.plan) {
            const p = this.data.plans.find(pl => pl.id === s.planId);
            obj.plan = p ? { name: p.name, price: p.price, speedLimit: p.speedLimit } : null;
          }
          return obj;
        });
      },
      create: async ({ data, include }: { data: any; include?: any }): Promise<any> => {
        const id = 'sess-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newSession: Session = {
          id,
          userId: data.userId,
          planId: data.planId,
          macAddress: data.macAddress || 'EC:F4:BB:22:' + Math.floor(10 + Math.random() * 89) + ':AA',
          ipAddress: data.ipAddress || '192.168.88.' + Math.floor(100 + Math.random() * 150),
          startTime: data.startTime ? new Date(data.startTime).toISOString() : now,
          endTime: data.endTime ? new Date(data.endTime).toISOString() : null,
          status: data.status || 'ACTIVE',
          dataUsed: data.dataUsed || 0,
          sessionToken: data.sessionToken || ('kj_tok_' + Math.random().toString(36).substring(2, 10)),
          routerSessionId: data.routerSessionId || ('*' + Math.floor(10 + Math.random() * 89).toString(16).toUpperCase()),
          createdAt: now,
          updatedAt: now
        };
        this.data.sessions.unshift(newSession);
        this.save();
        const obj: any = { ...newSession };
        if (include?.user) obj.user = this.data.users.find(u => u.id === newSession.userId);
        if (include?.plan) obj.plan = this.data.plans.find(p => p.id === newSession.planId);
        return obj;
      },
      update: async ({ where, data }: { where: { id?: string; sessionToken?: string }; data: Partial<Session> }): Promise<Session> => {
        const idx = this.data.sessions.findIndex(s => {
          if (where.id && s.id === where.id) return true;
          if (where.sessionToken && s.sessionToken === where.sessionToken) return true;
          return false;
        });
        if (idx === -1) throw new Error('Session not found');
        this.data.sessions[idx] = {
          ...this.data.sessions[idx],
          ...data,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return this.data.sessions[idx];
      },
      count: async (args?: { where?: any }): Promise<number> => {
        if (!args?.where) return this.data.sessions.length;
        return this.data.sessions.filter(s => {
          if (args.where.status && s.status !== args.where.status) return false;
          return true;
        }).length;
      }
    };
  }

  get payment() {
    return {
      findUnique: async ({ where, include }: { where: { id?: string; checkoutRequestId?: string }; include?: any }): Promise<any | null> => {
        const item = this.data.payments.find(p => {
          if (where.id && p.id === where.id) return true;
          if (where.checkoutRequestId && p.checkoutRequestId === where.checkoutRequestId) return true;
          return false;
        });
        if (!item) return null;
        const obj: any = { ...item };
        if (include?.user) obj.user = this.data.users.find(u => u.id === item.userId);
        if (include?.plan) obj.plan = this.data.plans.find(pl => pl.id === item.planId);
        return obj;
      },
      findMany: async (args?: { where?: any; skip?: number; take?: number; orderBy?: any; include?: any }): Promise<any[]> => {
        let results = [...this.data.payments];
        if (args?.where) {
          const w = args.where;
          results = results.filter(p => {
            if (w.status && p.status !== w.status) return false;
            if (w.createdAt?.gte && new Date(p.createdAt) < new Date(w.createdAt.gte)) return false;
            return true;
          });
        }
        if (args?.orderBy?.createdAt === 'desc') {
          results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        const skip = args?.skip || 0;
        const take = args?.take !== undefined ? args.take : results.length;
        const sliced = results.slice(skip, skip + take);

        return sliced.map(p => {
          const obj: any = { ...p };
          if (args?.include?.user) {
            const u = this.data.users.find(usr => usr.id === p.userId);
            obj.user = u ? { phone: u.phone, firstName: u.firstName, lastName: u.lastName } : null;
          }
          if (args?.include?.plan) {
            const pl = this.data.plans.find(plan => plan.id === p.planId);
            obj.plan = pl ? { name: pl.name, price: pl.price } : null;
          }
          return obj;
        });
      },
      create: async ({ data }: { data: any }): Promise<Payment> => {
        const id = 'pay-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newPayment: Payment = {
          id,
          userId: data.userId,
          planId: data.planId,
          amount: Number(data.amount),
          mpesaReceiptNumber: data.mpesaReceiptNumber || null,
          checkoutRequestId: data.checkoutRequestId || ('ws_CO_' + Date.now()),
          status: data.status || 'PENDING',
          paymentMethod: data.paymentMethod || 'MPESA',
          createdAt: now,
          updatedAt: now
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
        this.data.payments[idx] = {
          ...this.data.payments[idx],
          ...data,
          updatedAt: new Date().toISOString()
        };
        this.save();
        return this.data.payments[idx];
      },
      aggregate: async ({ where, _sum }: { where?: any; _sum?: { amount?: boolean } }): Promise<{ _sum: { amount: number | null } }> => {
        let results = [...this.data.payments];
        if (where) {
          results = results.filter(p => {
            if (where.status && p.status !== where.status) return false;
            if (where.createdAt?.gte && new Date(p.createdAt) < new Date(where.createdAt.gte)) return false;
            return true;
          });
        }
        const total = results.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        return { _sum: { amount: total } };
      },
      count: async (args?: { where?: any }): Promise<number> => {
        if (!args?.where) return this.data.payments.length;
        return this.data.payments.filter(p => {
          if (args.where.status && p.status !== args.where.status) return false;
          return true;
        }).length;
      }
    };
  }

  get voucher() {
    return {
      findUnique: async ({ where }: { where: { id?: string; code?: string } }): Promise<Voucher | null> => {
        return this.data.vouchers.find(v => {
          if (where.id && v.id === where.id) return true;
          if (where.code && v.code.toUpperCase() === where.code.toUpperCase()) return true;
          return false;
        }) || null;
      },
      findMany: async (args?: { where?: any; orderBy?: any }): Promise<Voucher[]> => {
        let list = [...this.data.vouchers];
        if (args?.where) {
          if (args.where.isRedeemed !== undefined) {
            list = list.filter(v => v.isRedeemed === args.where.isRedeemed);
          }
        }
        return list;
      },
      create: async ({ data }: { data: any }): Promise<Voucher> => {
        const id = 'vch-' + Math.random().toString(36).substring(2, 9);
        const now = new Date().toISOString();
        const newVoucher: Voucher = {
          id,
          code: data.code.toUpperCase(),
          planId: data.planId,
          userId: data.userId || null,
          amount: data.amount || 0,
          isRedeemed: false,
          redeemedAt: null,
          expiresAt: data.expiresAt || new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
          createdAt: now
        };
        this.data.vouchers.unshift(newVoucher);
        this.save();
        return newVoucher;
      },
      update: async ({ where, data }: { where: { id?: string; code?: string }; data: Partial<Voucher> }): Promise<Voucher> => {
        const idx = this.data.vouchers.findIndex(v => {
          if (where.id && v.id === where.id) return true;
          if (where.code && v.code.toUpperCase() === where.code.toUpperCase()) return true;
          return false;
        });
        if (idx === -1) throw new Error('Voucher not found');
        this.data.vouchers[idx] = {
          ...this.data.vouchers[idx],
          ...data
        };
        this.save();
        return this.data.vouchers[idx];
      }
    };
  }

  async $disconnect() {
    this.save();
  }
}

// Export singleton instance as PrismaClient replacement
export const db = new LocalDB();
export const PrismaClient = function () {
  return db;
} as any;
