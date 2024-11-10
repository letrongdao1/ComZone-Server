import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateChatRoomDTO } from './create-chat-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Chat rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewChatRoom(
    @Req() req: any,
    @Body() createChatRoomDto: CreateChatRoomDTO,
  ) {
    return this.chatRoomsService.createChatRoom(req.user.id, createChatRoomDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getChatRoomsByUser(@Req() req: any) {
    return this.chatRoomsService.getChatRoomByUserId(req.user.id);
  }
}
