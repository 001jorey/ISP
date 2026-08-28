import { db } from '../database/db';

class MpesaService {
  async initiateSTKPush(_request: any): Promise<any> {
    return {
      MerchantRequestID: 'N/A',
      CheckoutRequestID: 'N/A',
      ResponseCode: '0',
      ResponseDescription: 'M-Pesa replaced with Admin Activation workflow',
      CustomerMessage: 'Please submit connection request for admin approval.'
    };
  }

  async querySTKPushStatus(_checkoutRequestId: string): Promise<any> {
    return { ResultCode: '0', ResultDesc: 'Admin Activation System Active' };
  }

  async handleCallback(_callbackData: any): Promise<void> {
    // Admin activation model active
  }
}

export default new MpesaService();
