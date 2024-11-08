import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateChatRoomDTO } from './create-chat-room.dto';
import { ComicService } from '../comics/comics.service';
import { ExchangesService } from '../exchanges/exchanges.service';

@Injectable()
export class ChatRoomsService extends BaseService<ChatRoom> {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(ExchangesService)
    private readonly exchangesService: ExchangesService,
  ) {
    super(chatRoomsRepository);
  }

  async createChatRoom(userId: string, dto: CreateChatRoomDTO) {
    const firstUser = await this.usersService.getOne(userId);
    const secondUser = await this.usersService.getOne(dto.secondUser);

    if (!firstUser || !secondUser || firstUser.id === secondUser.id)
      throw new NotFoundException('Invalid user!');

    if ((!dto.comics && !dto.exchange) || (dto.comics && dto.exchange))
      throw new BadRequestException(
        'There must be exactly only 1 comics or 1 exchange for a chat room!',
      );

    const newChatRoom = this.chatRoomsRepository.create({
      firstUser,
      secondUser,
      comics: dto.comics && (await this.comicsService.findOne(dto.comics)),
      exchange:
        dto.exchange && (await this.exchangesService.getOne(dto.exchange)),
    });

    return await this.chatRoomsRepository.save(newChatRoom);
  }

  async getChatRoomByUserId(userId: string) {
    const fetched = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'firstUser')
      .leftJoinAndSelect('chat_room.secondUser', 'secondUser')
      .leftJoinAndSelect('chat_room.comics', 'comics')
      .leftJoinAndSelect('chat_room.exchange', 'exchange')
      .where('firstUser.id = :userId', { userId })
      .orWhere('secondUser.id = :userId', { userId })
      .orderBy('chat_room.updatedAt', 'DESC')
      .getMany();

    return fetched.map((chatRoom) => {
      const first =
        chatRoom.firstUser.id === userId
          ? chatRoom.firstUser
          : chatRoom.secondUser;
      const second =
        chatRoom.firstUser.id !== userId
          ? chatRoom.firstUser
          : chatRoom.secondUser;

      return {
        ...chatRoom,
        firstUser: first,
        secondUser: second,
      };
    });
  }

  async updateLastMessage(chatRoomId: string, message: string) {
    return await this.chatRoomsRepository
      .update(chatRoomId, {
        lastMessage: message,
      })
      .then(() => this.getOne(chatRoomId));
  }
}
