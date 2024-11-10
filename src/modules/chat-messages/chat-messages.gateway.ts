import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatMessagesService } from './chat-messages.service';
import { Server, Socket } from 'socket.io';
import { CreateMessageDTO } from './dto/create-message.dto';

@WebSocketGateway(3001, { cors: { origin: '*' } })
export class ChatMessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('send-new-message')
  async createMessage(
    @MessageBody() createMessageDto: CreateMessageDTO,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessage =
      await this.chatMessagesService.createNewMessage(createMessageDto);

    console.log('NEW: ', newMessage);
    this.server.emit('new-message', newMessage);
  }

  @SubscribeMessage('typing')
  typing(
    @MessageBody('isTyping') isTyping: boolean,
    @ConnectedSocket() client: Socket,
  ) {
    const name = this.chatMessagesService.getClientName(client.id);

    client.broadcast.emit('typing', { name, isTyping });
  }
}
