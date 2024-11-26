import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatMessagesService } from './chat-messages.service';
import { Server, Socket } from 'socket.io';
import { CreateMessageDTO } from './dto/create-message.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatMessagesGateway {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  async joinRoom(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (message && message.userId) {
      return this.chatMessagesService.joinRoom(message.userId, client);
    }
  }

  @SubscribeMessage('send-new-message')
  async createMessage(@MessageBody() createMessageDto: CreateMessageDTO) {
    const newMessage =
      await this.chatMessagesService.createNewMessage(createMessageDto);

    this.server.to(newMessage.chatRoom.id).emit('new-message', newMessage);
  }

  @SubscribeMessage('update-room-list')
  async updateUserRoomList(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const newRoomList = await this.chatMessagesService.updateRoomList(
      message.userId,
    );
    client.emit('new-room-list', newRoomList);
  }

  @SubscribeMessage('update-message-list')
  async updateMessageList(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const newMessageList = await this.chatMessagesService.getMessagesByChatRoom(
      message.userId,
      message.chatRoomId,
    );
    client.emit('new-message-list', newMessageList);
  }

  @SubscribeMessage('get-unread-list')
  async getUnreadList(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    const unreadList = await this.chatMessagesService.getUnreadList(
      message.userId,
    );
    client.emit('new-unread-list', unreadList);
  }
}
