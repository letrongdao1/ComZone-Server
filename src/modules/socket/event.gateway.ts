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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173', // The frontend origin
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // Enable credentials (if needed)
  },
})
@Injectable() // Make sure the gateway is injectable
export class EventsGateway implements OnModuleInit {
  @WebSocketServer() server: Server;

  constructor(private readonly bidService: BidService) {}

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
}
