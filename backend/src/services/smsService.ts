class SMSService {
  async sendSMS(to: string, message: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(to);
    console.log(`📱 [KijaniLink SMS -> ${formattedPhone}]: ${message}`);
    return true;
  }

  async sendPaymentConfirmation(phone: string, amount: number, receiptNumber: string): Promise<boolean> {
    const message = `KijaniLink: Payment confirmed! KES ${amount} received via M-Pesa. Receipt: ${receiptNumber}. Your high-speed WiFi session is now ACTIVE. Enjoy blazing speeds!`;
    return await this.sendSMS(phone, message);
  }

  async sendSessionExpiry(phone: string, planName: string): Promise<boolean> {
    const message = `KijaniLink: Your ${planName} session has expired. Reconnect via our portal to renew your speed tier. - KijaniLink Smart ISP`;
    return await this.sendSMS(phone, message);
  }

  async sendWelcomeMessage(phone: string, firstName?: string): Promise<boolean> {
    const name = firstName ? ` ${firstName}` : '';
    const message = `Habari${name}! Welcome to KijaniLink Ultra-Fast WiFi. Instant access, seamless browsing. Support: 0700 000 001.`;
    return await this.sendSMS(phone, message);
  }

  async sendOTP(phone: string, otp: string): Promise<boolean> {
    const message = `Your KijaniLink verification code is: ${otp}. Valid for 10 minutes. Do not share.`;
    return await this.sendSMS(phone, message);
  }

  async sendLowBalanceAlert(phone: string, remainingTime: string): Promise<boolean> {
    const message = `KijaniLink Alert: Your internet session expires in ${remainingTime}. Renew now on the portal to avoid interruption.`;
    return await this.sendSMS(phone, message);
  }

  private formatPhoneNumber(phone: string): string {
    phone = phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '+254' + phone.slice(1);
    } else if (phone.startsWith('254')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+254')) {
      phone = '+254' + phone;
    }
    return phone;
  }
}

export default new SMSService();
