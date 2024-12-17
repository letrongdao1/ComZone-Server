import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatRoomsService } from './chat-rooms.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import {
  createChatRoomWithSellerDTO,
  CreateComicsChatRoomDTO,
  CreateExchangeChatRoomDTO,
} from './create-chat-room.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Chat rooms')
@Controller('chat-rooms')
export class ChatRoomsController {
  constructor(private readonly chatRoomsService: ChatRoomsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('comics')
  createNewChatRoomForComics(
    @Req() req: any,
    @Body() createChatRoomDto: CreateComicsChatRoomDTO,
  ) {
    return this.chatRoomsService.createChatRoomForComics(
      req.user.id,
      createChatRoomDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('exchange')
  createNewChatRoomForExchange(
    @Req() req: any,
    @Body() createChatRoomDto: CreateExchangeChatRoomDTO,
  ) {
    return this.chatRoomsService.createChatRoomForExchange(
      req.user.id,
      createChatRoomDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('seller')
  createNewChatRoomWithSeller(
    @Req() req: any,
    @Body() createChatRoomDto: createChatRoomWithSellerDTO,
  ) {
    return this.chatRoomsService.createChatRoomWithSeller(
      req.user.id,
      createChatRoomDto.sellerId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getChatRoomsByUser(@Req() req: any) {
    return this.chatRoomsService.getChatRoomByUserId(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string, @Req() req: any) {
    return this.chatRoomsService.getById(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteChatRoom(@Param('id') id: string) {
    return this.chatRoomsService.softDelete(id);
  }
}
