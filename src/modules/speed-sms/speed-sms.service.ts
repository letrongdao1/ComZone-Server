import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpeedSmsService {
  private readonly baseUrl: string = process.env.SPEED_SMS_BASE_URL;
  private readonly accessToken: string;

  constructor(private readonly httpService: HttpService) {
    this.accessToken = process.env.SPEED_SMS_ACCESS_TOKEN;
  }

  async sendSMS(phones: string[], content: string): Promise<void> {
    const authHeader = this.getAuthorizationHeader();
    const payload = {
      to: phones,
      content: `COMZONE - Ma OTP xac thuc cua ban la: ${content}`,
      sms_type: 5,
      sender: process.env.SPEED_SMS_DEVICE_ID,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.baseUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
        }),
      );

      const data = response.data;
      return data;
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw new HttpException(
        `Failed to send SMS: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private getAuthorizationHeader(): string {
    const token = `${this.accessToken}:x`;
    return `Basic ${Buffer.from(token).toString('base64')}`;
  }
}
