export interface UserSession {
  sessionId: string;
  username: string;
  ipAddress: string;
  macAddress: string;
  bytesIn: number;
  bytesOut: number;
  uptime: string;
  rateLimit?: string;
  signalStrength?: string;
}

export interface RouterHardwareStatus {
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
}

class MikrotikService {
  private host: string;
  private username: string;
  private isSimulated: boolean;

  constructor() {
    this.host = process.env.MIKROTIK_HOST || '192.168.88.1';
    this.username = process.env.MIKROTIK_USERNAME || 'admin';
    this.isSimulated = true;
  }

  async getRouterStatus(): Promise<RouterHardwareStatus> {
    const cpuVariation = Math.min(95, Math.max(12, Math.floor(25 + Math.sin(Date.now() / 10000) * 15 + Math.random() * 8)));
    
    return {
      connected: true,
      model: 'MikroTik CCR2004-16G-2S+ (KijaniLink Core Edge)',
      version: 'RouterOS v7.14.3 (stable)',
      cpuLoad: cpuVariation,
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
          rxRate: `${(18 + Math.random() * 24).toFixed(1)} Mbps`,
          txRate: `${(6 + Math.random() * 12).toFixed(1)} Mbps`
        },
        {
          name: 'ether1-gateway (Hotspot LAN)',
          type: 'ethernet',
          status: 'up',
          rxBytes: '128.5 GB',
          txBytes: '394.2 GB',
          rxRate: `${(12 + Math.random() * 16).toFixed(1)} Mbps`,
          txRate: `${(28 + Math.random() * 32).toFixed(1)} Mbps`
        },
        {
          name: 'wlan1 (Sector North 5GHz)',
          type: 'wireless',
          status: 'up',
          rxBytes: '45.1 GB',
          txBytes: '120.3 GB',
          rxRate: `${(4.2 + Math.random() * 5).toFixed(1)} Mbps`,
          txRate: `${(11.5 + Math.random() * 8).toFixed(1)} Mbps`
        },
        {
          name: 'wlan2 (Sector South 5GHz)',
          type: 'wireless',
          status: 'up',
          rxBytes: '52.7 GB',
          txBytes: '148.9 GB',
          rxRate: `${(5.8 + Math.random() * 6).toFixed(1)} Mbps`,
          txRate: `${(14.2 + Math.random() * 9).toFixed(1)} Mbps`
        }
      ]
    };
  }

  async getActiveUsers(): Promise<UserSession[]> {
    return [
      {
        sessionId: '*4F',
        username: '+254712345678',
        ipAddress: '192.168.88.145',
        macAddress: 'DC:A6:32:89:12:FA',
        bytesIn: 485 * 1024 * 1024,
        bytesOut: 112 * 1024 * 1024,
        uptime: '25m 12s',
        rateLimit: '15M/15M',
        signalStrength: '-52 dBm (Excellent)'
      },
      {
        sessionId: '*5A',
        username: '+254723456789',
        ipAddress: '192.168.88.172',
        macAddress: 'A4:C3:F0:4B:92:11',
        bytesIn: 3820 * 1024 * 1024,
        bytesOut: 640 * 1024 * 1024,
        uptime: '8h 14m',
        rateLimit: '50M/50M',
        signalStrength: '-61 dBm (Good)'
      },
      {
        sessionId: '*6B',
        username: 'guest_guest_9921',
        ipAddress: '192.168.88.188',
        macAddress: '3C:22:FB:91:02:44',
        bytesIn: 120 * 1024 * 1024,
        bytesOut: 24 * 1024 * 1024,
        uptime: '12m 40s',
        rateLimit: '10M/10M',
        signalStrength: '-68 dBm (Fair)'
      }
    ];
  }

  async createHotspotUser(username: string, password: string, profile: string = 'default'): Promise<void> {
    console.log(`📡 [MikroTik API] Hotspot user created: ${username} (profile: ${profile})`);
  }

  async removeHotspotUser(username: string): Promise<void> {
    console.log(`📡 [MikroTik API] Hotspot user terminated/removed: ${username}`);
  }

  async disconnectUser(sessionId: string): Promise<void> {
    console.log(`📡 [MikroTik API] Active session kicked: ${sessionId}`);
  }

  async createUserProfile(profileName: string, rateLimit: string, sessionTimeout: string): Promise<void> {
    console.log(`📡 [MikroTik API] User profile updated: ${profileName} rate=${rateLimit} timeout=${sessionTimeout}`);
  }

  formatSpeedLimit(uploadSpeed: string, downloadSpeed: string): string {
    return `${uploadSpeed}/${downloadSpeed}`;
  }

  formatSessionTimeout(hours: number): string {
    return `${hours * 3600}s`;
  }
}

export default new MikrotikService();
