import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessagesService: ChatMessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('chat-room/:chat_room_id')
  getMessagesByChatRoom(@Req() req: any, @Param('chat_room_id') id: string) {
    return this.chatMessagesService.getMessagesByChatRoom(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('chat-room/is-read/:chat_room_id')
  updateIsReadByChatRoom(
    @Req() req: any,
    @Param('chat_room_id') chatRoomId: string,
  ) {
    return this.chatMessagesService.updateIsReadMessageByChatRoom(
      req.user.id,
      chatRoomId,
    );
  }
}
