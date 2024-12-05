import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SpeedSmsService {
  private readonly baseUrl: string = process.env.ESMS_BASE_URL;
  private readonly apiKey: string;
  private readonly secretKey: string;

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.ESMS_API_KEY;
    this.secretKey = process.env.ESMS_SECRET_KEY;
    if (!this.apiKey || !this.secretKey) {
      throw new Error('ESMS environment variable is not set.');
    }
  }

  async sendSMS(phone: string, content: string): Promise<void> {
    const payload = {
      ApiKey: this.apiKey,
      Content: content,
      Phone: phone,
      SecretKey: this.secretKey,
      SmsType: '8',
      IsUnicode: '0',
      Sandbox: '0',
    };

    const response = await firstValueFrom(
      this.httpService.post(this.baseUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const data = response.data;
    return data;
  }
}
