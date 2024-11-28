import { OnModuleInit, Injectable, Inject, forwardRef } from '@nestjs/common';
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
import { User } from 'src/entities/users.entity';
import { AuctionService } from '../auction/auction.service';
import { UsersService } from '../users/users.service';
import { DepositsService } from '../deposits/deposits.service';
import { RecipientType } from 'src/entities/announcement.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly bidService: BidService,
    private readonly announcementService: AnnouncementService,
    @Inject(forwardRef(() => AuctionService))
    private readonly auctionService: AuctionService, // AuctionService should be correctly injected here
    private readonly userService: UsersService,
    private readonly depositsService: DepositsService,
  ) {}

  private userSockets = new Map<string, Set<string>>();

  onModuleInit() {
    // Setting up the WebSocket connection
    this.server.on('connection', (socket) => {
      console.log(`Socket connected1: ${socket.id}`);

      // Listen for 'joinRoom' event and join the room
      socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room:`, socket.rooms);
      });
      socket.onAny((event, data) => {
        console.log(`Event received: ${event}`, data); // Logs every event received from any client
      });
      console.log('123123', socket.handshake.query.user);

      // Handle socket disconnection
      socket.on('disconnect', (reason) => {
        if (typeof socket.handshake.query.user === 'string')
          this.userService.updateUserIsActive(
            socket.handshake.query.user,
            false,
          );
        console.log(`Socket ${socket.id} disconnected: ${reason}`);
      });
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log('New Message Received:', body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
  }

  @SubscribeMessage('placeBid')
  async onPlaceBid(@MessageBody() createBidDto: CreateBidDto): Promise<any> {
    try {
      console.log('Received bid data:', createBidDto);
      const placeBid = await this.bidService.create(createBidDto);
      console.log('PlaceBid:', placeBid);

      this.server.emit('bidUpdate', { placeBid });
      return { success: true, bid: placeBid };
    } catch (error) {
      console.error('Error handling bid:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
  @SubscribeMessage('updateAuctionStatus')
  async handleUpdateAuctionStatus(
    @MessageBody()
    data: {
      auctionId: string;
      currentPrice: number;
      user: User;
      type: string;
    },
  ) {
    const { auctionId, currentPrice, user, type } = data;

    if (type === 'maxPrice') {
      const bid = await this.bidService.create({
        userId: user.id,
        auctionId,
        price: currentPrice,
      });
      console.log('11111', bid);
    }

    const updatedAuction =
      await this.auctionService.updateAuctionStatusToCompleted(
        auctionId,
        currentPrice,
        user,
      );
    console.log('12312', updatedAuction);

    // Call refund logic

    const refund = await this.depositsService.refundDepositToWinner(auctionId);
    console.log('Refund', refund);

    // Emit the updated auction to notify clients
    this.server.emit('auctionUpdated', updatedAuction);
  }

  async notifyUser(
    userId: string,
    message: string,
    ids: { exchangeId?: string; orderId?: string; auctionId?: string },
    title: string,
    type: string,
    recipientType: RecipientType,
    status?: string,
  ) {
    try {
      const createAnnouncementDto: CreateAnnouncementDto = {
        auctionId: ids.auctionId,
        orderId: ids.orderId,
        exchangeId: ids.exchangeId,
        userId,
        message,
        title,
        type,
        status,
        recipientType,
      };

      const savedAnnouncement =
        await this.announcementService.createAnnouncement(
          createAnnouncementDto,
        );
      console.log('Saved announcement:', savedAnnouncement);

      // Emit to the room where the user has joined (based on userId)
      this.server.to(userId).emit('notification', {
        id: savedAnnouncement.id,
        message,
        auction: ids.auctionId,
        title,
        type,
        status,
        recipientType,
      });
    } catch (error) {
      console.error('Error in notifyUser:', error);
      throw new Error('Failed to notify the user');
    }
  }

  async notifyUsers(
    userIds: string[],
    message: string,
    auction: { id: string },
    title: string,
    type: string,
    status: string,
  ) {
    for (const userId of userIds) {
      try {
        const createAnnouncementDto: CreateAnnouncementDto = {
          auctionId: auction.id,
          userId,
          message,
          title,
          type,
          status,
        };
        const savedAnnouncement =
          await this.announcementService.createAnnouncement(
            createAnnouncementDto,
          );
        console.log('Saved announcement for user:', userId);

        // Emit to the room where each user has joined
        this.server.to(userId).emit('notification', {
          id: savedAnnouncement.id,
          message,
          auction,
          title,
          type,
          status,
        });
      } catch (error) {
        console.error(`Error notifying user ${userId}:`, error);
      }
    }
  }

  broadcastNotification(message: string) {
    console.log('Broadcasting notification to all clients');
    this.server.emit('notification', { message });
  }
}
