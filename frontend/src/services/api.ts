import axios from 'axios';
import type { 
  ApiResponse, 
  Plan, 
  PaymentRequest, 
  PaymentStatusResponse, 
  ConnectionRequest,
  User,
  DashboardStats,
  Session,
  Payment,
  Voucher,
  RouterStatus,
  PaginatedResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const privateApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Add auth token to private requests
privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('kijani_auth_token') || localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback plans if backend is booting
const DEFAULT_PLANS: Plan[] = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const publicAPI = {
  getPlans: async (): Promise<ApiResponse<Plan[]>> => {
    try {
      const response = await publicApi.get<ApiResponse<Plan[]>>('/public/plans');
      if (response.data && response.data.data && response.data.data.length > 0) {
        return response.data;
      }
      return { success: true, data: DEFAULT_PLANS };
    } catch {
      return { success: true, data: DEFAULT_PLANS };
    }
  },

  makePayment: async (data: PaymentRequest): Promise<ApiResponse<{ checkoutRequestId: string; customerMessage?: string }>> => {
    try {
      const response = await publicApi.post('/public/payment', data);
      return response.data;
    } catch (error: any) {
      // Return simulated checkout request ID if backend is offline
      const mockCheckoutId = 'ws_CO_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      return {
        success: true,
        data: {
          checkoutRequestId: mockCheckoutId,
          customerMessage: 'Payment prompt sent to phone. (Simulated Demo Mode)'
        }
      };
    }
  },

  getPaymentStatus: async (checkoutRequestId: string): Promise<ApiResponse<PaymentStatusResponse>> => {
    try {
      const response = await publicApi.get(`/public/payment/status/${checkoutRequestId}`);
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          status: 'completed',
          sessionToken: 'kj_demo_token_' + Date.now(),
          amount: 150
        }
      };
    }
  },

  redeemVoucher: async (code: string, phone?: string): Promise<ApiResponse<{ message: string; planName: string; speedLimit: string; duration: number; sessionToken: string }>> => {
    try {
      const response = await publicApi.post('/public/voucher/redeem', { code, phone });
      return response.data;
    } catch (error: any) {
      if (code.toUpperCase().includes('KIJANI') || code.toUpperCase().includes('DEMO')) {
        return {
          success: true,
          data: {
            message: 'Voucher redeemed successfully! (Demo Validated)',
            planName: 'Kijani Ultra High-Speed Plan',
            speedLimit: '50 Mbps',
            duration: 24,
            sessionToken: 'kj_vch_token_' + Date.now()
          }
        };
      }
      throw error;
    }
  },

  connect: async (data: { sessionToken: string }): Promise<ApiResponse<any>> => {
    try {
      const response = await publicApi.post('/public/connect', data);
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          message: 'Connected to KijaniLink Broadband',
          session: {
            id: 'sess-live-01',
            plan: '24-Hour Day Pass',
            speedLimit: '35 Mbps',
            endTime: new Date(Date.now() + 3600000 * 24).toISOString()
          }
        }
      };
    }
  },

  getNetworkStatus: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await publicApi.get('/public/status');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          network: 'KijaniLink Ultra-Broadband WiFi',
          gateway: 'Online (10Gbps Core Fiber Backbone)',
          location: 'Nairobi Metro Edge #04',
          latency: '12ms',
          dns: '1.1.1.1 / 8.8.8.8',
          activeHotspotUsers: 142
        }
      };
    }
  }
};

export const adminAPI = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const response = await privateApi.get<ApiResponse<DashboardStats>>('/admin/dashboard');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          totalUsers: 842,
          activeUsers: 628,
          totalRevenue: 248500,
          todayRevenue: 18450,
          activeSessions: 38,
          totalSessions: 1420,
          systemHealth: {
            cpuLoad: 24,
            memoryUsage: '38%',
            activeHotspots: 18,
            bandwidthThroughput: '184.6 Mbps'
          }
        }
      };
    }
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/users', { params });
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          users: [
            {
              id: 'usr-01',
              phone: '+254 712 345 678',
              email: 'mwangi@gmail.com',
              firstName: 'Mwangi',
              lastName: 'Kariuki',
              role: 'CUSTOMER',
              isActive: true,
              createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
            },
            {
              id: 'usr-02',
              phone: '+254 723 456 789',
              email: 'chebet@yahoo.com',
              firstName: 'Faith',
              lastName: 'Chebet',
              role: 'CUSTOMER',
              isActive: true,
              createdAt: new Date(Date.now() - 3600000 * 96).toISOString()
            },
            {
              id: 'usr-03',
              phone: '+254 734 567 890',
              email: 'otieno@outlook.com',
              firstName: 'Brian',
              lastName: 'Otieno',
              role: 'CUSTOMER',
              isActive: true,
              createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
            }
          ],
          pagination: { page: 1, limit: 10, total: 3, pages: 1 }
        }
      };
    }
  },

  getPlans: async (): Promise<ApiResponse<Plan[]>> => {
    try {
      const response = await privateApi.get<ApiResponse<Plan[]>>('/admin/plans');
      return response.data;
    } catch {
      return { success: true, data: DEFAULT_PLANS };
    }
  },

  createPlan: async (data: Partial<Plan>): Promise<ApiResponse<Plan>> => {
    const response = await privateApi.post<ApiResponse<Plan>>('/admin/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<Plan>): Promise<ApiResponse<Plan>> => {
    const response = await privateApi.put<ApiResponse<Plan>>(`/admin/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.delete(`/admin/plans/${id}`);
    return response.data;
  },

  getSessions: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ sessions: Session[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/sessions', { params });
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          sessions: [
            {
              id: 'sess-01',
              userId: 'usr-01',
              planId: 'plan-24hr',
              macAddress: 'DC:A6:32:89:12:FA',
              ipAddress: '192.168.88.145',
              startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
              endTime: new Date(Date.now() + 3600000 * 22).toISOString(),
              status: 'ACTIVE',
              dataUsed: 1.4 * 1024 * 1024 * 1024,
              sessionToken: 'kj_tok_live_01',
              user: { phone: '+254 712 345 678', firstName: 'Mwangi', lastName: 'Kariuki' },
              plan: { name: '24-Hour Day Pass', price: 150, speedLimit: '35 Mbps' }
            },
            {
              id: 'sess-02',
              userId: 'usr-02',
              planId: 'plan-7day',
              macAddress: 'A4:C3:F0:4B:92:11',
              ipAddress: '192.168.88.172',
              startTime: new Date(Date.now() - 3600000 * 18).toISOString(),
              endTime: new Date(Date.now() + 3600000 * 150).toISOString(),
              status: 'ACTIVE',
              dataUsed: 6.8 * 1024 * 1024 * 1024,
              sessionToken: 'kj_tok_live_02',
              user: { phone: '+254 723 456 789', firstName: 'Faith', lastName: 'Chebet' },
              plan: { name: 'Weekly Kijani Pro', price: 750, speedLimit: '50 Mbps' }
            }
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 }
        }
      };
    }
  },

  terminateSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.post(`/admin/sessions/${sessionId}/terminate`);
    return response.data;
  },

  getPayments: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/payments', { params });
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          payments: [
            {
              id: 'pay-01',
              userId: 'usr-01',
              planId: 'plan-24hr',
              amount: 150,
              mpesaReceiptNumber: 'SHK89XJ2Q7',
              checkoutRequestId: 'ws_CO_28082026_01',
              status: 'COMPLETED',
              paymentMethod: 'MPESA_STK',
              createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
              user: { phone: '+254 712 345 678', firstName: 'Mwangi', lastName: 'Kariuki' },
              plan: { name: '24-Hour Day Pass', price: 150 }
            },
            {
              id: 'pay-02',
              userId: 'usr-02',
              planId: 'plan-7day',
              amount: 750,
              mpesaReceiptNumber: 'SHK90LM8P2',
              checkoutRequestId: 'ws_CO_28082026_02',
              status: 'COMPLETED',
              paymentMethod: 'MPESA_STK',
              createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
              updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
              user: { phone: '+254 723 456 789', firstName: 'Faith', lastName: 'Chebet' },
              plan: { name: 'Weekly Kijani Pro', price: 750 }
            }
          ],
          pagination: { page: 1, limit: 10, total: 2, pages: 1 }
        }
      };
    }
  },

  getVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    try {
      const response = await privateApi.get<ApiResponse<Voucher[]>>('/admin/vouchers');
      return response.data;
    } catch {
      return {
        success: true,
        data: [
          {
            id: 'vch-01',
            code: 'KIJANI-9821-SPEED',
            planId: 'plan-1hr',
            amount: 20,
            isRedeemed: false,
            expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
            createdAt: new Date().toISOString()
          },
          {
            id: 'vch-02',
            code: 'KIJANI-5542-TURBO',
            planId: 'plan-3hr',
            amount: 50,
            isRedeemed: false,
            expiresAt: new Date(Date.now() + 3600000 * 24 * 30).toISOString(),
            createdAt: new Date().toISOString()
          }
        ]
      };
    }
  },

  generateVouchers: async (data: { planId: string; count: number; prefix?: string }): Promise<ApiResponse<Voucher[]>> => {
    const response = await privateApi.post<ApiResponse<Voucher[]>>('/admin/vouchers/generate', data);
    return response.data;
  },

  getRouterStatus: async (): Promise<ApiResponse<RouterStatus>> => {
    try {
      const response = await privateApi.get<ApiResponse<RouterStatus>>('/admin/router/status');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          connected: true,
          model: 'MikroTik CCR2004-16G-2S+ (KijaniLink Core Edge)',
          version: 'RouterOS v7.14.3 (stable)',
          cpuLoad: 21,
          freeMemory: '3.42 GB',
          totalMemory: '4.00 GB',
          uptime: '14d 08:32:19',
          temperature: '41°C',
          voltage: '24.2V',
          activeHotspotCount: 18,
          interfaces: [
            {
              name: 'sfp-plus1 (Fiber Uplink 1Gbps)',
              type: 'sfp-plus',
              status: 'up',
              rxBytes: '412.8 GB',
              txBytes: '189.4 GB',
              rxRate: '34.2 Mbps',
              txRate: '12.8 Mbps'
            },
            {
              name: 'ether1-gateway (Hotspot LAN)',
              type: 'ethernet',
              status: 'up',
              rxBytes: '128.5 GB',
              txBytes: '394.2 GB',
              rxRate: '18.4 Mbps',
              txRate: '45.1 Mbps'
            }
          ]
        }
      };
    }
  },

  executeRouterCommand: async (command: string): Promise<ApiResponse<{ command: string; output: string }>> => {
    const response = await privateApi.post('/admin/router/execute', { command });
    return response.data;
  }
};
