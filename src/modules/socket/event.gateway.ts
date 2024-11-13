import { OnModuleInit, Injectable } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BidService } from '../bid/bid.service';
import { CreateBidDto } from '../bid/dto/bid.dto';
import { CreateAnnouncementDto } from '../announcement/dto/announcement.dto';
import { AnnouncementService } from '../announcement/announcement.service';

@WebSocketGateway({
  cors: {
    origin: '*', // The frontend origin
    allowedHeaders: ['Content-Type'],
    credentials: true, // Enable credentials (if needed)
  },
})
@Injectable() // Make sure the gateway is injectable
export class EventsGateway implements OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly bidService: BidService,
    private readonly announcementService: AnnouncementService,
  ) {}

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Connected: ${socket.id}`);
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  @SubscribeMessage('placeBid')
  async onPlaceBid(@MessageBody() createBidDto: CreateBidDto): Promise<any> {
    try {
      console.log('Received bid data:', createBidDto);

      // Create a new bid using the BidService

      // Call the create method of BidService to store the bid
      const placeBid = await this.bidService.create(createBidDto);
      console.log(placeBid);

      // Emit the updated bid to all clients
      this.server.emit('bidUpdate', {
        placeBid,
      });

      // Acknowledge the client with success and the created bid data
      return { success: true, bid: placeBid };
    } catch (error) {
      console.error('Error handling bid:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
  // Emit a notification to a specific user by userId
  // Emit a notification to a specific user by userId
  async notifyUser(
    userId: string,
    message: string,
    auctionId: string,
    title: string,
  ) {
    try {
      // 1. Save the announcement to the database
      const createAnnouncementDto: CreateAnnouncementDto = {
        auctionId,
        userId, // Assuming the user ID is part of the DTO
        message, // The message you want to store
        title, // The title of the announcement (could be dynamic)
      };

      // Save the announcement
      const savedAnnouncement =
        await this.announcementService.createAnnouncement(
          createAnnouncementDto,
        );

      // 2. Emit the notification to the specific user
      this.server.to(userId).emit('notification', {
        message: message,
        auctionId,
        title,
      });

      // Optionally, log the saved announcement
      console.log('Announcement saved:', savedAnnouncement);
    } catch (error) {
      console.error('Error in notifyUser:', error);
      throw new Error('Failed to notify the user');
    }
  }

  async notifyUsers(
    userIds: string[],
    message: string,
    auctionId: string,
    title: string,
  ) {
    console.log(':::::::::::::::::', userIds);

    // Iterate through all userIds
    for (const userId of userIds) {
      try {
        // Save the announcement to the database for each user
        const createAnnouncementDto: CreateAnnouncementDto = {
          auctionId,
          userId,
          message,
          title,
        };

        // Save the announcement
        const savedAnnouncement =
          await this.announcementService.createAnnouncement(
            createAnnouncementDto,
          );

        // Emit the notification to the specific user
        this.server.to(userId).emit('notification', {
          message: message,
          auctionId,
          title,
        });

        // Optionally log the saved announcement
        console.log('Announcement saved:', savedAnnouncement);
      } catch (error) {
        console.error(`Error notifying user ${userId}:`, error);
      }
    }
  }

  // Broadcast a notification to all connected clients
  broadcastNotification(message: string) {
    this.server.emit('notification', { message });
  }
}
