export type UserRole = 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN' | 'TECHNICIAN' | 'SUPPORT';

export type ConnectionType = 'HOTSPOT' | 'PPPOE';

export type ActivationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface User {
  id: string;
  email?: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  sessions?: Session[];
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
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

export interface ClientActivationRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  location: string;
  connectionType: ConnectionType;
  pppoeUsername?: string;
  pppoePassword?: string;
  planId: string;
  macAddress: string;
  ipAddress: string;
  status: ActivationStatus;
  gracePeriodMinutes: number;
  graceExpiresAt: string;
  sessionToken: string;
  approvedAt?: string;
  approvedBy?: string;
  fullExpiresAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  plan?: Plan;
}

export interface Session {
  id: string;
  userId: string;
  planId: string;
  macAddress?: string;
  ipAddress?: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'GRACE_PERIOD';
  dataUsed: number;
  sessionToken: string;
  routerSessionId?: string;
  isGracePeriod?: boolean;
  user?: {
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  plan?: {
    name: string;
    price: number;
    speedLimit?: string;
  };
}

export interface Payment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  mpesaReceiptNumber?: string;
  checkoutRequestId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    phone: string;
    firstName?: string;
    lastName?: string;
  };
  plan?: {
    name: string;
    price: number;
  };
}

export interface Voucher {
  id: string;
  code: string;
  planId: string;
  userId?: string;
  amount: number;
  isRedeemed: boolean;
  redeemedAt?: string;
  expiresAt: string;
  createdAt: string;
  plan?: Plan;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  activeSessions: number;
  totalSessions: number;
  pendingActivations?: number;
  systemHealth?: {
    cpuLoad: number;
    memoryUsage: string;
    activeHotspots: number;
    bandwidthThroughput: string;
  };
}

export interface RouterStatus {
  connected: boolean;
  model: string;
  version: string;
  cpuLoad: number;
  freeMemory: string;
  totalMemory: string;
  uptime: string;
  temperature: string;
  voltage: string;
  activeHotspotCount: number;
  interfaces: Array<{
    name: string;
    type: string;
    status: 'up' | 'down';
    rxBytes: string;
    txBytes: string;
    rxRate: string;
    txRate: string;
  }>;
  activeUsers?: Array<{
    sessionId: string;
    username: string;
    ipAddress: string;
    macAddress: string;
    bytesIn: number;
    bytesOut: number;
    uptime: string;
    rateLimit?: string;
    signalStrength?: string;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  errors?: Array<{ msg: string; param: string }>;
}

export interface ConnectionRequest {
  sessionToken: string;
}

export interface SpeedTestResult {
  ping: number;
  jitter: number;
  download: number;
  upload: number;
  server: string;
  ip: string;
}
