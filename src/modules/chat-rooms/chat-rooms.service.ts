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
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ExchangesService } from '../exchanges/exchanges.service';

@Injectable()
export class ChatRoomsService extends BaseService<ChatRoom> {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(ExchangesService)
    private readonly exchangesService: ExchangesService,
  ) {
    super(chatRoomsRepository);
  }

  async getOne(id: string): Promise<ChatRoom> {
    return await this.chatRoomsRepository.findOne({
      where: { id },
      relations: [
        'firstUser',
        'secondUser',
        'comics',
        'exchange',
        'exchange.post',
        'exchange.requestUser',
        'lastMessage',
      ],
    });
  }

  async createChatRoom(userId: string, dto: CreateChatRoomDTO) {
    const firstUser = await this.usersService.getOne(userId);
    const secondUser = await this.usersService.getOne(dto.secondUser);

    if (!firstUser || !secondUser || firstUser.id === secondUser.id)
      throw new NotFoundException('Invalid user!');

    if ((!dto.comics && !dto.exchange) || (dto.comics && dto.exchange))
      throw new BadRequestException(
        'There must be exactly only 1 comics or 1 exchange request for a chat room!',
      );

    if (dto.comics) {
      const comics = await this.comicsService.findOne(dto.comics);
      if (!comics) throw new NotFoundException('Comics cannot be found!');
    }

    if (dto.exchange) {
      const exchange = await this.exchangesService.getOne(dto.exchange);
      if (!exchange)
        throw new NotFoundException('Exchange request cannot be found!');
    }

    const foundChatRooms = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'first')
      .leftJoinAndSelect('chat_room.secondUser', 'second')
      .leftJoinAndSelect('chat_room.exchange', 'exchange')
      .leftJoinAndSelect('chat_room.comics', 'comics')
      .where('first.id = :userId AND second.id = :secondUserId', {
        userId,
        secondUserId: dto.secondUser,
      })
      .orWhere('first.id = :secondUserId AND second.id = :userId', {
        secondUserId: dto.secondUser,
        userId,
      })
      .getMany();

    const foundRoom = foundChatRooms.find(
      (chatRoom) =>
        (chatRoom.comics && dto.comics && chatRoom.comics.id === dto.comics) ||
        true,
    );

    if (foundRoom) {
      return await this.chatRoomsRepository
        .update(foundRoom.id, {
          updatedAt: new Date(),
        })
        .then(() =>
          this.chatRoomsRepository.findOne({
            where: {
              id: foundRoom.id,
            },
            relations: [
              'firstUser',
              'secondUser',
              'comics',
              'exchange',
              'lastMessage',
            ],
          }),
        );
    }

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
      .leftJoinAndSelect('exchange.post', 'post')
      .leftJoinAndSelect('post.user', 'postUser')
      .leftJoinAndSelect('exchange.requestUser', 'requestUser')
      .leftJoinAndSelect('chat_room.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.comics', 'lastMessageComics')
      .leftJoinAndSelect('lastMessage.user', 'lastUser')
      .where('firstUser.id = :userId', { userId })
      .orWhere('secondUser.id = :userId', { userId })
      .orderBy('lastMessage.createdAt', 'DESC')
      .take(8)
      .getMany();

    return await Promise.all(
      fetched.map(async (chatRoom) => {
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
          lastMessage: chatRoom.lastMessage
            ? {
                ...chatRoom.lastMessage,
                mine: chatRoom.lastMessage.user.id === userId,
              }
            : null,
        };
      }),
    );
  }

  async getById(userId: string, chatRoomId: string) {
    const chatRoom = await this.getOne(chatRoomId);
    const firstUser =
      chatRoom.firstUser.id === userId
        ? chatRoom.firstUser
        : chatRoom.secondUser;
    const secondUser =
      chatRoom.firstUser.id !== userId
        ? chatRoom.firstUser
        : chatRoom.secondUser;

    return {
      ...chatRoom,
      firstUser,
      secondUser,
      lastMessage: chatRoom.lastMessage
        ? {
            ...chatRoom.lastMessage,
            mine: chatRoom.lastMessage.user.id === userId,
          }
        : null,
    };
  }

  async updateLastMessage(chatRoomId: string, messageId: string) {
    const chatMessage = await this.chatMessagesRepository.findOne({
      where: { id: messageId },
    });

    if (!chatMessage) throw new NotFoundException('Message cannot be found!');

    return await this.chatRoomsRepository
      .update(chatRoomId, {
        lastMessage: chatMessage,
      })
      .then(() => this.getOne(chatRoomId));
  }

  async softDelete(id: string): Promise<any> {
    return await this.chatRoomsRepository.softDelete(id);
  }
}
