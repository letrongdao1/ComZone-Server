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
    origin: '*',
  },
})
@Injectable()
export class EventsGateway implements OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(
    private readonly bidService: BidService,
    private readonly announcementService: AnnouncementService,
  ) {}

  private userSockets = new Map<string, Set<string>>();

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
        this.removeSocketId(socket);
      });
    });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() userId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(socket.id);
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  }

  private removeSocketId(socket: Socket) {
    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        console.log(`Removed socket ID ${socket.id} for user ${userId}`);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
          console.log(`No remaining sockets for user ${userId}, removed user.`);
        }
        break;
      }
    }
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

  async notifyUser(
    userId: string,
    message: string,
    auctionId: string,
    title: string,
    type: string,
    status: string,
  ) {
    console.log('notifyUser called with:', { userId, message });
    try {
      const createAnnouncementDto: CreateAnnouncementDto = {
        auctionId,
        userId,
        message,
        title,
        type,
        status,
      };

      console.log('Creating announcement...');
      const savedAnnouncement =
        await this.announcementService.createAnnouncement(
          createAnnouncementDto,
        );
      console.log('Saved announcement:', savedAnnouncement);

      const socketIds = Array.from(this.userSockets.get(userId) || []);
      console.log('Socket IDs for user:', socketIds);
      this.server.emit('notification', { message: 'Test notification' });

      // socketIds.forEach((socketId) => {
      //   this.server.to(socketId).emit('notification', {
      //     id: savedAnnouncement.id,
      //     message,
      //     auctionId,
      //     title,
      //     type,
      //     status,
      //   });
      //   console.log('Emitting notification to socket ID:', socketId);
      // });
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
    type: string,
    status: string,
  ) {
    // for (const userId of userIds) {
    //   try {
    //     const createAnnouncementDto: CreateAnnouncementDto = {
    //       auctionId,
    //       userId,
    //       message,
    //       title,
    //       type,
    //       status,
    //     };
    //     const savedAnnouncement =
    //       await this.announcementService.createAnnouncement(
    //         createAnnouncementDto,
    //       );
    //     console.log('Saved announcement for user:', userId);
    //     const socketIds = Array.from(this.userSockets.get(userId) || []);
    //     socketIds.forEach((socketId) => {
    //       this.server.to(socketId).emit('notification', {
    //         id: savedAnnouncement.id,
    //         message: message,
    //         auctionId,
    //         title,
    //         type,
    //         status,
    //       });
    //     });
    //   } catch (error) {
    //     console.error(`Error notifying user ${userId}:`, error);
    //   }
    // }
  }

  broadcastNotification(message: string) {
    console.log('Broadcasting notification to all clients');
    this.server.emit('notification', { message });
  }
}
