import { OnModuleInit, Injectable, Inject, forwardRef } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { BidService } from '../bid/bid.service';
import { CreateBidDto } from '../bid/dto/bid.dto';
import { CreateAnnouncementDto } from '../announcement/dto/announcement.dto';
import { AnnouncementService } from '../announcement/announcement.service';
import { User } from 'src/entities/users.entity';
import { AuctionService } from '../auction/auction.service';
import { UsersService } from '../users/users.service';
import { DepositsService } from '../deposits/deposits.service';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import { Auction } from 'src/entities/auction.entity';

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
    @Inject(forwardRef(() => AnnouncementService))
    private readonly announcementService: AnnouncementService,
    @Inject(forwardRef(() => AuctionService))
    private readonly auctionService: AuctionService, // AuctionService should be correctly injected here
    // @Inject(forwardRef(() => OrderItemsService))
    // private readonly orderItemService: OrderItemsService,
    private readonly userService: UsersService,
    private readonly depositsService: DepositsService,
  ) {}

  private activeUsers = new Map<string, Set<string>>(); // Track user sockets

  onModuleInit() {
    // Setting up the WebSocket connection
    this.server.on('connection', (socket) => {
      console.log(`Socket connected1: ${socket.id}`);

      // Listen for 'joinRoom' event and join the room
      socket.on('joinRoom', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`, socket.rooms);
      });

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
    console.log('data', data);
    let updatedAuction;
    if (type === 'maxPrice') {
      const bid = await this.bidService.create({
        userId: user.id,
        auctionId,
        price: currentPrice,
        type,
      });
      console.log('11111', bid);
      updatedAuction = await this.auctionService.updateAuctionStatusToCompleted(
        auctionId,
        user,
      );
      console.log('12312', updatedAuction);
    }
    if (type === 'currentPrice') {
      updatedAuction =
        await this.auctionService.updateAuctionStatusWithCurrentPriceToCompleted(
          auctionId,
        );
    }

    await this.depositsService.refundDepositToWinner(auctionId);

    // Emit the updated auction to notify clients
    this.server.emit('auctionUpdated', updatedAuction);
  }

  async notifyUser(
    userId: string,
    message: string,
    ids: {
      exchangeId?: string;
      orderId?: string;
      auctionId?: Auction;
      transactionId?: string;
    },
    title: string,
    type: AnnouncementType,
    recipientType: RecipientType,
    status?: string,
  ) {
    console.log('Passed ids object:', ids);

    try {
      const createAnnouncementDto: CreateAnnouncementDto = {
        auctionId: ids.auctionId?.id,
        orderId: ids.orderId,
        exchangeId: ids.exchangeId,
        transactionId: ids.transactionId,
        userId,
        message,
        title,
        type,
        status,
        recipientType,
      };

      // Create the announcement
      const savedAnnouncement =
        await this.announcementService.createAnnouncement(
          createAnnouncementDto,
        );
      console.log('Saved announcement:', savedAnnouncement);

      this.server.to(userId).emit('notification', {
        id: savedAnnouncement.id,
        message,
        auction: ids.auctionId,
        order: savedAnnouncement.order,
        exchange: ids.exchangeId,
        transaction: ids.transactionId,
        title,
        type,
        recipientType,
        status,
        createdAt: savedAnnouncement.createdAt,
      });
    } catch (error) {
      console.error('Error in notifyUser:', error);
      throw new Error('Failed to notify the user');
    }
  }

  async notifyUsers(
    userIds: string[],
    message: string,
    auction: { id: Auction },
    title: string,
    type: AnnouncementType,
    status: string,
    recipientType: RecipientType,
  ) {
    for (const userId of userIds) {
      try {
        const createAnnouncementDto: CreateAnnouncementDto = {
          auctionId: auction.id.id,
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
        console.log('Saved announcementLOSER:', savedAnnouncement);
        // Emit to the room where each user has joined
        this.server.to(userId).emit('notification', {
          id: savedAnnouncement.id,
          message,
          auction: auction.id,
          title,
          type,
          status,
          recipientType,
          createdAt: savedAnnouncement.createdAt,
        });
      } catch (error) {
        console.error(`Error notifying user ${userId}:`, error);
      }
    }
  }

  // broadcastNotification(message: string) {
  //   console.log('Broadcasting notification to all clients');
  //   this.server.emit('notification', { message });
  // }
}
