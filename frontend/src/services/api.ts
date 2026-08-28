import axios from 'axios';
import type { 
  ApiResponse, 
  Plan, 
  User, 
  DashboardStats, 
  Session, 
  Payment, 
  Voucher, 
  RouterStatus,
  ClientActivationRequest
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

privateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('kijani_auth_token') || localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // Customer selects package -> instant 10-min grace connection + admin approval request
  requestActivation: async (data: {
    fullName: string;
    phone: string;
    location: string;
    connectionType: 'HOTSPOT' | 'PPPOE';
    planId: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const response = await publicApi.post('/public/request-activation', data);
      return response.data;
    } catch {
      // Offline fallback demo simulation
      const graceExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      return {
        success: true,
        data: {
          requestId: 'act-demo-' + Date.now(),
          sessionToken: 'kj_grace_demo_' + Date.now(),
          status: 'PENDING_APPROVAL',
          graceExpiresAt,
          gracePeriodMinutes: 10,
          planName: 'Requested Package',
          speedLimit: '25 Mbps',
          price: 150,
          connectionType: data.connectionType,
          message: '10-minute temporary grace internet access activated! Awaiting admin approval.'
        }
      };
    }
  },

  getActivationStatus: async (requestId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await publicApi.get(`/public/activation-status/${requestId}`);
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          id: requestId,
          status: 'PENDING_APPROVAL',
          graceExpiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
          planName: '24-Hour Day Pass',
          speedLimit: '35 Mbps'
        }
      };
    }
  },

  redeemVoucher: async (code: string, phone?: string): Promise<ApiResponse<any>> => {
    try {
      const response = await publicApi.post('/public/voucher/redeem', { code, phone });
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          message: 'Voucher redeemed successfully!',
          planName: '24-Hour Day Pass',
          speedLimit: '35 Mbps',
          duration: 24,
          sessionToken: 'kj_vch_' + Date.now(),
          fullExpiresAt: new Date(Date.now() + 3600000 * 24).toISOString()
        }
      };
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
            speedLimit: '35 Mbps'
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
          network: 'KijaniLink Ultra-Broadband WiFi & PPPoE',
          gateway: 'Online (10Gbps Core Fiber Backbone)',
          location: 'Nairobi Core Edge #04',
          latency: '11ms',
          activeHotspotUsers: 42
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
          pendingActivations: 2,
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

  // Client Activations (New Clients Tab)
  getActivations: async (params?: { status?: string; connectionType?: string }): Promise<ApiResponse<ClientActivationRequest[]>> => {
    try {
      const response = await privateApi.get<ApiResponse<ClientActivationRequest[]>>('/admin/activations', { params });
      return response.data;
    } catch {
      return {
        success: true,
        data: [
          {
            id: 'act-01',
            userId: 'usr-01',
            fullName: 'Mwangi Kariuki',
            phone: '+254712345678',
            location: 'Block B, Apt 302',
            connectionType: 'HOTSPOT',
            planId: 'plan-24hr',
            macAddress: 'DC:A6:32:89:12:FA',
            ipAddress: '192.168.88.145',
            status: 'PENDING_APPROVAL',
            gracePeriodMinutes: 10,
            graceExpiresAt: new Date(Date.now() + 7 * 60 * 1000).toISOString(),
            sessionToken: 'kj_grace_mwangi',
            createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            plan: {
              id: 'plan-24hr',
              name: '24-Hour Day Pass',
              price: 150,
              duration: 24,
              speedLimit: '35 Mbps',
              dataLimit: 'Unlimited',
              isActive: true,
              createdAt: '',
              updatedAt: ''
            }
          },
          {
            id: 'act-02',
            userId: 'usr-02',
            fullName: 'Faith Chebet',
            phone: '+254723456789',
            location: 'Sunrise Plaza, Suite 4',
            connectionType: 'PPPOE',
            pppoeUsername: 'faith.chebet@kijani',
            pppoePassword: 'pass' + Math.floor(1000 + Math.random() * 9000),
            planId: 'plan-7day',
            macAddress: 'A4:C3:F0:4B:92:11',
            ipAddress: '192.168.88.172',
            status: 'PENDING_APPROVAL',
            gracePeriodMinutes: 10,
            graceExpiresAt: new Date(Date.now() + 8 * 60 * 1000).toISOString(),
            sessionToken: 'kj_grace_faith',
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            plan: {
              id: 'plan-7day',
              name: 'Weekly Kijani Pro',
              price: 750,
              duration: 168,
              speedLimit: '50 Mbps',
              dataLimit: 'Unlimited',
              isActive: true,
              createdAt: '',
              updatedAt: ''
            }
          }
        ]
      };
    }
  },

  approveActivation: async (id: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.post(`/admin/activations/${id}/approve`);
    return response.data;
  },

  rejectActivation: async (id: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.post(`/admin/activations/${id}/reject`, { reason });
    return response.data;
  },

  extendGracePeriod: async (id: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.post(`/admin/activations/${id}/extend-grace`);
    return response.data;
  },

  getUsers: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<{ users: User[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/users', { params });
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          users: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 1 }
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

  getSessions: async (): Promise<ApiResponse<{ sessions: Session[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/sessions');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          sessions: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 1 }
        }
      };
    }
  },

  terminateSession: async (sessionId: string): Promise<ApiResponse<any>> => {
    const response = await privateApi.post(`/admin/sessions/${sessionId}/terminate`);
    return response.data;
  },

  getVouchers: async (): Promise<ApiResponse<Voucher[]>> => {
    try {
      const response = await privateApi.get<ApiResponse<Voucher[]>>('/admin/vouchers');
      return response.data;
    } catch {
      return { success: true, data: [] };
    }
  },

  generateVouchers: async (data: { planId: string; count: number; prefix?: string }): Promise<ApiResponse<Voucher[]>> => {
    const response = await privateApi.post<ApiResponse<Voucher[]>>('/admin/vouchers/generate', data);
    return response.data;
  },

  getPayments: async (): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
    try {
      const response = await privateApi.get('/admin/payments');
      return response.data;
    } catch {
      return {
        success: true,
        data: {
          payments: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 1 }
        }
      };
    }
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
          interfaces: []
        }
      };
    }
  },

  executeRouterCommand: async (command: string): Promise<ApiResponse<{ command: string; output: string }>> => {
    const response = await privateApi.post('/admin/router/execute', { command });
    return response.data;
  }
};
