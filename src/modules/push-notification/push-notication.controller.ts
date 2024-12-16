import { Controller, Post, Body } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';

@Controller()
export class PushNotificationController {
  constructor(
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Post('send-notification')
  async sendNotification(
    @Body('fcmToken') fcmToken: string, // Assume fcmToken and message are passed in the body
    @Body('message') message: string,
  ) {
    await this.pushNotificationService.sendPushNotification(fcmToken, message);
    return { message: 'Notification sent successfully' };
  }
}
