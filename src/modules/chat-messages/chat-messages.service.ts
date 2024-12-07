import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { Not, Repository } from 'typeorm';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { CreateMessageDTO } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';
import { Socket } from 'socket.io';
import { ComicService } from '../comics/comics.service';
import { ChatMessageTypeEnum } from './dto/chat-message-type.enum';

@Injectable()
export class ChatMessagesService extends BaseService<ChatMessage> {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
    @Inject(ChatRoomsService)
    private readonly chatRoomsService: ChatRoomsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ComicService)
    private readonly comicsService: ComicService,
  ) {
    super(chatMessagesRepository);
  }

  async joinRoom(userId: string, client: Socket) {
    const chatRoomList =
      await this.chatRoomsService.getChatRoomByUserId(userId);

    return await Promise.all(
      chatRoomList.map(async (chatRoom) => {
        client.join(chatRoom.id);
        console.log(`${userId} joined ${chatRoom.id}`);
      }),
    );
  }

  async createNewMessage(createMessageDto: CreateMessageDTO) {
    const chatRoom = await this.chatRoomsService.getOne(
      createMessageDto.chatRoom,
    );

    const user = await this.usersService.getOne(createMessageDto.userId);

    const comicsList = createMessageDto.comics
      ? await Promise.all(
          createMessageDto.comics.map(async (comicsId: string) => {
            const comics = await this.comicsService.findOne(comicsId);
            if (!comics) throw new NotFoundException('Comics cannot be found!');
            if (comics.sellerId.id !== user.id)
              throw new ForbiddenException(
                'This comics does not belong to this user!',
              );
            return comics;
          }),
        )
      : null;

    let repliedToMessage: ChatMessage;
    if (createMessageDto.repliedToMessage) {
      repliedToMessage = await this.getOne(createMessageDto.repliedToMessage);
      if (!repliedToMessage)
        throw new NotFoundException('Message cannot be found!');
    }

    const newMessage = this.chatMessagesRepository.create({
      user,
      chatRoom,
      comics: comicsList || null,
      type: createMessageDto.comics
        ? ChatMessageTypeEnum.COMICS
        : createMessageDto.type,
      content: createMessageDto.content,
      repliedToMessage: repliedToMessage || null,
    });

    return await this.chatMessagesRepository
      .save(newMessage)
      .then(async (res) => {
        await this.chatRoomsService.updateLastMessage(
          createMessageDto.chatRoom,
          res.id,
        );
      })
      .then(() => this.getOne(newMessage.id));
  }

  groupMessageByDate = (
    list: any[],
  ): { date: Date; messages: ChatMessage[] }[] => {
    if (list.length === 0) {
      return;
    } else {
      const groupedList = [
        {
          date: list[0].createdAt,
          messages: [list[0]],
        },
      ];
      let tempDate = list[0].createdAt.toDateString();
      let count = 0;
      list.map((item, index) => {
        if (index === 0) return;
        if (item.createdAt.toDateString() === tempDate) {
          if (groupedList[count].messages !== undefined)
            groupedList[count].messages.push(item);
          else {
            groupedList[count].messages = [item];
          }
        } else {
          tempDate = list[index].createdAt.toDateString();
          groupedList.push({
            date: list[index].createdAt,
            messages: [list[index]],
          });
          count++;
        }
      });
      return groupedList;
    }
  };

  async getMessagesByChatRoom(userId: string, chatRoomId: string) {
    const messagesList = await this.chatMessagesRepository.find({
      where: {
        chatRoom: {
          id: chatRoomId,
        },
      },
      relations: ['user'],
      order: {
        createdAt: 'ASC',
      },
    });

    const filteredList = messagesList.map((message) => {
      return {
        ...message,
        mine: message.user.id === userId,
      };
    });

    return this.groupMessageByDate(filteredList);
  }

  async updateRoomList(userId: string) {
    return await this.chatRoomsService.getChatRoomByUserId(userId);
  }

  async updateIsReadMessageByChatRoom(userId: string, chatRoomId: string) {
    const chatRoom = await this.chatRoomsService.getOne(chatRoomId);
    if (!chatRoom) throw new NotFoundException('Chat room cannot be found!');

    return await this.chatMessagesRepository
      .update(
        {
          user: {
            id: Not(userId),
          },
          chatRoom: {
            id: chatRoomId,
          },
        },
        { isRead: true },
      )
      .then(() => this.chatRoomsService.getOne(chatRoomId));
  }

  async getUnreadList(userId: string) {
    const chatRoomList =
      await this.chatRoomsService.getChatRoomByUserId(userId);

    return chatRoomList.filter(
      (room) =>
        room.lastMessage &&
        room.lastMessage.user.id !== userId &&
        room.lastMessage.isRead === false,
    );
  }
}
