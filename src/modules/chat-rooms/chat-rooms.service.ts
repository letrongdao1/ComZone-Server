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
import { ExchangeRequestsService } from '../exchange-requests/exchange-requests.service';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { ExchangeOffersService } from '../exchange-offers/exchange-offers.service';

@Injectable()
export class ChatRoomsService extends BaseService<ChatRoom> {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(ExchangeRequestsService)
    private readonly exchangeRequestsService: ExchangeRequestsService,
    @Inject(ExchangeOffersService)
    private readonly exchangeOffersService: ExchangeOffersService,
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
        'exchangeRequest',
        'exchangeRequest.requestComics',
        'lastMessage',
      ],
    });
  }

  async createChatRoom(userId: string, dto: CreateChatRoomDTO) {
    const firstUser = await this.usersService.getOne(userId);
    const secondUser = await this.usersService.getOne(dto.secondUser);

    if (!firstUser || !secondUser || firstUser.id === secondUser.id)
      throw new NotFoundException('Invalid user!');

    if (
      (!dto.comics && !dto.exchangeRequest) ||
      (dto.comics && dto.exchangeRequest)
    )
      throw new BadRequestException(
        'There must be exactly only 1 comics or 1 exchange request for a chat room!',
      );

    if (dto.comics) {
      const comics = await this.comicsService.findOne(dto.comics);
      if (!comics) throw new NotFoundException('Comics cannot be found!');
    }

    if (dto.exchangeRequest) {
      const exchangeRequest = await this.exchangeRequestsService.getOne(
        dto.exchangeRequest,
      );
      if (!exchangeRequest)
        throw new NotFoundException(
          'Exchange request request cannot be found!',
        );
    }

    const foundChatRooms = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'first')
      .leftJoinAndSelect('chat_room.secondUser', 'second')
      .leftJoinAndSelect('chat_room.exchangeRequest', 'exchangeRequest')
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
        (chatRoom.exchangeRequest &&
          dto.exchangeRequest &&
          chatRoom.exchangeRequest.id === dto.exchangeRequest),
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
              'exchangeRequest',
              'lastMessage',
            ],
          }),
        );
    }

    const newChatRoom = this.chatRoomsRepository.create({
      firstUser,
      secondUser,
      comics: dto.comics && (await this.comicsService.findOne(dto.comics)),
      exchangeRequest:
        dto.exchangeRequest &&
        (await this.exchangeRequestsService.getOne(dto.exchangeRequest)),
    });

    return await this.chatRoomsRepository.save(newChatRoom);
  }

  async getChatRoomByUserId(userId: string) {
    const fetched = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'firstUser')
      .leftJoinAndSelect('chat_room.secondUser', 'secondUser')
      .leftJoinAndSelect('chat_room.comics', 'comics')
      .leftJoinAndSelect('chat_room.exchangeRequest', 'exchangeRequest')
      .leftJoinAndSelect('exchangeRequest.requestComics', 'requestComics')
      .leftJoinAndSelect('exchangeRequest.user', 'requestUser')
      .leftJoinAndSelect('chat_room.lastMessage', 'lastMessage')
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
}
