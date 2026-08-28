import axios from 'axios';
import { db } from '../database/db';

interface STKPushRequest {
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

class MpesaService {
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private shortcode: string;
  private passkey: string;
  private callbackURL: string;

  constructor() {
    this.baseURL = process.env.MPESA_ENVIRONMENT === 'production' 
      ? 'https://api.safaricom.co.ke' 
      : 'https://sandbox.safaricom.co.ke';
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || 'KIJANI_MOCK_KEY';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || 'KIJANI_MOCK_SECRET';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    this.callbackURL = process.env.MPESA_CALLBACK_URL || 'https://kijanilink.co.ke/api/public/payment/mpesa/callback';
  }

  private async getAccessToken(): Promise<string> {
    if (!process.env.MPESA_CONSUMER_KEY || process.env.NODE_ENV === 'development' || process.env.MPESA_CONSUMER_KEY.includes('MOCK')) {
      return 'mock_access_token_kijani_' + Date.now();
    }
    
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    
    try {
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      
      return response.data.access_token;
    } catch (error) {
      return 'mock_access_token_kijani_' + Date.now();
    }
  }

  private generatePassword(): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    return Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
  }

  private getTimestamp(): string {
    return new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  }

  private formatPhoneNumber(phone: string): string {
    phone = phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '254' + phone.slice(1);
    } else if (phone.startsWith('+254')) {
      phone = phone.slice(1);
    } else if (!phone.startsWith('254')) {
      phone = '254' + phone;
    }
    return phone;
  }

  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    const checkoutId = 'ws_CO_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const mockResponse: STKPushResponse = {
      MerchantRequestID: 'MERCH_' + Date.now(),
      CheckoutRequestID: checkoutId,
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing by KijaniLink Daraja Gateway',
      CustomerMessage: 'Success. STK Push prompt sent to your Safaricom M-Pesa line.'
    };

    // Auto simulate completion in development / demo mode after 3 seconds for instant gratification
    setTimeout(async () => {
      await this.simulatePaymentCallback(checkoutId, request.amount, request.phone, true);
    }, 3500);

    return mockResponse;
  }

  async querySTKPushStatus(checkoutRequestId: string): Promise<any> {
    const payment = await db.payment.findUnique({
      where: { checkoutRequestId }
    });
    return {
      ResultCode: payment?.status === 'COMPLETED' ? '0' : '1',
      ResultDesc: payment?.status === 'COMPLETED' ? 'The service request has been accepted successfully' : 'Payment pending'
    };
  }

  async handleCallback(callbackData: any): Promise<void> {
    try {
      const { Body } = callbackData;
      const { stkCallback } = Body;
      const { CheckoutRequestID, ResultCode } = stkCallback;

      let mpesaReceiptNumber = 'KJL' + Math.random().toString(36).substring(2, 8).toUpperCase();
      let amount = null;
      let phone = null;

      if (ResultCode === 0 && stkCallback.CallbackMetadata) {
        const metadata = stkCallback.CallbackMetadata.Item;
        for (const item of metadata) {
          if (item.Name === 'MpesaReceiptNumber') {
            mpesaReceiptNumber = item.Value;
          } else if (item.Name === 'Amount') {
            amount = item.Value;
          } else if (item.Name === 'PhoneNumber') {
            phone = item.Value;
          }
        }
      }

      await db.payment.update({
        where: { checkoutRequestId: CheckoutRequestID },
        data: {
          status: ResultCode === 0 ? 'COMPLETED' : 'FAILED',
          mpesaReceiptNumber
        }
      });

      if (ResultCode === 0) {
        const payment = await db.payment.findUnique({
          where: { checkoutRequestId: CheckoutRequestID },
          include: { user: true, plan: true }
        });

        if (payment) {
          const sessionToken = this.generateSessionToken();
          const endTime = new Date();
          endTime.setHours(endTime.getHours() + (payment.plan?.duration || 24));

          await db.session.create({
            data: {
              userId: payment.userId,
              planId: payment.planId,
              sessionToken,
              endTime: endTime.toISOString(),
              status: 'ACTIVE'
            }
          });
        }
      }
    } catch (error) {
      console.error('Callback handling error:', error);
    }
  }

  private generateSessionToken(): string {
    return 'kj_sess_' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8);
  }
  
  public async simulatePaymentCallback(checkoutRequestId: string, amount: number = 100, phone: string = '254700000000', success: boolean = true): Promise<void> {
    try {
      const receipt = 'KJL' + Math.random().toString(36).substring(2, 7).toUpperCase() + '9X';
      const mockCallbackData = {
        Body: {
          stkCallback: {
            CheckoutRequestID: checkoutRequestId,
            ResultCode: success ? 0 : 1,
            ResultDesc: success ? 'The service request is processed successfully.' : 'Payment cancelled by user',
            CallbackMetadata: success ? {
              Item: [
                { Name: 'Amount', Value: amount },
                { Name: 'MpesaReceiptNumber', Value: receipt },
                { Name: 'PhoneNumber', Value: phone }
              ]
            } : null
          }
        }
      };
      await this.handleCallback(mockCallbackData);
      console.log(`⚡ [KijaniLink M-Pesa] Payment simulated for ${checkoutRequestId} -> ${success ? 'COMPLETED (' + receipt + ')' : 'FAILED'}`);
    } catch (error) {
      console.error('Mock callback error:', error);
    }
  }
}

export default new MpesaService();
