import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ChatRoom } from 'src/entities/chat-room.entity';
import { IsNull, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  CreateComicsChatRoomDTO,
  CreateExchangeChatRoomDTO,
} from './create-chat-room.dto';
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

  async createChatRoomForComics(userId: string, dto: CreateComicsChatRoomDTO) {
    const firstUser = await this.usersService.getOne(userId);

    const comics = await this.comicsService.findOne(dto.comics);
    if (!comics) throw new NotFoundException('Comics cannot be found!');

    const secondUser = await this.usersService.getOne(comics.sellerId.id);

    const foundRoom = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'first')
      .leftJoinAndSelect('chat_room.secondUser', 'second')
      .leftJoinAndSelect('chat_room.comics', 'comics')
      .where(
        'first.id = :userId AND second.id = :secondUserId AND comics.id = :comicsId',
        {
          userId,
          secondUserId: secondUser.id,
          comicsId: comics.id,
        },
      )
      .orWhere(
        'first.id = :secondUserId AND second.id = :userId AND comics.id = :comicsId',
        {
          userId,
          secondUserId: secondUser.id,
          comicsId: comics.id,
        },
      )
      .getOne();

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
            relations: ['firstUser', 'secondUser', 'comics', 'lastMessage'],
          }),
        );
    }

    const newChatRoom = this.chatRoomsRepository.create({
      firstUser,
      secondUser,
      comics,
    });

    return await this.chatRoomsRepository.save(newChatRoom);
  }

  async createChatRoomForExchange(
    userId: string,
    dto: CreateExchangeChatRoomDTO,
  ) {
    const firstUser = await this.usersService.getOne(userId);

    const exchange = await this.exchangesService.getOne(dto.exchange);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const secondUser = await this.usersService.getOne(exchange.post.user.id);

    const foundRoom = await this.chatRoomsRepository
      .createQueryBuilder('chat_room')
      .leftJoinAndSelect('chat_room.firstUser', 'first')
      .leftJoinAndSelect('chat_room.secondUser', 'second')
      .leftJoinAndSelect('chat_room.exchange', 'exchange')
      .where(
        'first.id = :userId AND second.id = :secondUserId AND exchange.id = :exchangeId',
        {
          userId,
          secondUserId: secondUser.id,
          exchangeId: exchange.id,
        },
      )
      .orWhere(
        'first.id = :secondUserId AND second.id = :userId AND exchange.id = :exchangeId',
        {
          userId,
          secondUserId: secondUser.id,
          exchangeId: exchange.id,
        },
      )
      .getOne();

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
            relations: ['firstUser', 'secondUser', 'exchange', 'lastMessage'],
          }),
        );
    }

    const newChatRoom = this.chatRoomsRepository.create({
      firstUser,
      secondUser,
      exchange,
    });

    return await this.chatRoomsRepository.save(newChatRoom);
  }

  async createChatRoomWithSeller(userId: string, sellerId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const seller = await this.usersService.getOne(sellerId);
    if (!seller) throw new NotFoundException('Seller cannot be found!');

    const checkExistedRoom = await this.chatRoomsRepository.findOne({
      where: [
        {
          firstUser: { id: userId },
          secondUser: { id: sellerId },
          comics: IsNull(),
          exchange: IsNull(),
        },
        {
          firstUser: { id: sellerId },
          secondUser: { id: userId },
          comics: IsNull(),
          exchange: IsNull(),
        },
      ],
    });

    if (checkExistedRoom) {
      await this.chatRoomsRepository.update(checkExistedRoom.id, {
        updatedAt: new Date(),
      });
      return checkExistedRoom;
    }

    const newChatRoom = this.chatRoomsRepository.create({
      firstUser: user,
      secondUser: seller,
    });

    return await this.chatRoomsRepository.save(newChatRoom).then((res) =>
      this.chatRoomsRepository.findOne({
        where: { id: res.id },
        relations: ['firstUser', 'secondUser', 'lastMessage'],
      }),
    );
  }

  async getChatRoomByUserId(userId: string) {
    const fetched = await this.chatRoomsRepository.find({
      where: [{ firstUser: { id: userId } }, { secondUser: { id: userId } }],
      relations: [
        'firstUser',
        'secondUser',
        'comics',
        'exchange',
        'lastMessage',
      ],
      order: { updatedAt: 'DESC' },
    });

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
        lastMessage: chatRoom.lastMessage
          ? {
              ...chatRoom.lastMessage,
              mine: chatRoom.lastMessage.user.id === userId,
            }
          : null,
      };
    });
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
