import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PushNotificationService {
  private serverKey: string =
    'BMa9rKeRZ1e5M8a2Lr99jwRk6TXHlXYKzWzMXWVHU6OpyUZaCrM5EewPwya9M7laDNcET8QoZeO4_LnWsbcwX3c';
  y;

  async sendPushNotification(fcmToken: string, message: string): Promise<void> {
    const url = 'https://fcm.googleapis.com/fcm/send';

    const payload = {
      to: fcmToken, // The recipient's FCM token
      notification: {
        title: 'New Notification',
        body: message,
      },
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `key=${this.serverKey}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('Push notification sent:', response.data);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
}
