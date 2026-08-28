import { db } from '../database/db';
import mikrotikService from './mikrotikService';
import smsService from './smsService';

export class SessionService {
  async createSession(userId: string, planId: string, sessionToken: string): Promise<any> {
    try {
      const plan = await db.plan.findUnique({
        where: { id: planId }
      });

      if (!plan) {
        throw new Error('Plan not found');
      }

      const endTime = new Date();
      endTime.setHours(endTime.getHours() + plan.duration);

      const session = await db.session.create({
        data: {
          userId,
          planId,
          sessionToken,
          endTime,
          status: 'ACTIVE'
        },
        include: {
          user: true,
          plan: true
        }
      });

      const profileName = `plan_${plan.id}`;
      const speedLimit = this.parseSpeedLimit(plan.speedLimit);
      const sessionTimeout = mikrotikService.formatSessionTimeout(plan.duration);

      try {
        await mikrotikService.createUserProfile(
          profileName,
          speedLimit,
          sessionTimeout
        );
      } catch (error) {
        // Continue
      }

      await mikrotikService.createHotspotUser(
        sessionToken,
        sessionToken,
        profileName
      );

      return session;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async terminateSession(sessionId: string): Promise<void> {
    try {
      const session = await db.session.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });

      if (!session) {
        throw new Error('Session not found');
      }

      await db.session.update({
        where: { id: sessionId },
        data: {
          status: 'TERMINATED',
          endTime: new Date().toISOString()
        }
      });

      await mikrotikService.removeHotspotUser(session.sessionToken);
      console.log(`✅ Session terminated: ${sessionId}`);
    } catch (error) {
      console.error('Error terminating session:', error);
      throw error;
    }
  }

  async getActiveSession(sessionToken: string): Promise<any> {
    try {
      const session = await db.session.findUnique({
        where: { sessionToken },
        include: {
          user: true,
          plan: true
        }
      });

      if (!session || session.status !== 'ACTIVE') {
        return null;
      }

      if (session.endTime && new Date() > new Date(session.endTime)) {
        await this.terminateSession(session.id);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error getting active session:', error);
      return null;
    }
  }

  async getUserActiveSessions(userId: string): Promise<any[]> {
    try {
      return await db.session.findMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          plan: true
        },
        orderBy: {
          startTime: 'desc'
        }
      });
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  async updateSessionUsage(sessionToken: string, dataUsed: number): Promise<void> {
    try {
      await db.session.update({
        where: { sessionToken },
        data: { dataUsed }
      });
    } catch (error) {
      console.error('Error updating session usage:', error);
    }
  }

  private parseSpeedLimit(speedLimit: string): string {
    const speed = speedLimit.replace(/[^\d]/g, '');
    const unit = speedLimit.includes('Gbps') ? 'G' : 'M';
    return `${speed || '10'}${unit}/${speed || '10'}${unit}`;
  }
}

export const sessionCleanup = async (): Promise<void> => {
  try {
    const expiredSessions = await db.session.findMany({
      where: {
        status: 'ACTIVE',
        endTime: {
          lt: new Date().toISOString()
        }
      }
    });

    for (const session of expiredSessions) {
      await new SessionService().terminateSession(session.id);
      
      const user = await db.user.findUnique({
        where: { id: session.userId }
      });

      if (user) {
        await smsService.sendSMS(
          user.phone,
          'Your KijaniLink internet session has expired. Purchase a new plan to continue high-speed browsing. - KijaniLink'
        );
      }
    }
  } catch (error) {
    console.error('Error during session cleanup:', error);
  }
};

export default new SessionService();
