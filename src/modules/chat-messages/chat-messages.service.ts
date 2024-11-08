import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ChatMessage } from 'src/entities/chat-message.entity';
import { Not, Repository } from 'typeorm';
import { ChatRoomsService } from '../chat-rooms/chat-rooms.service';
import { CreateMessageDTO } from './dto/create-message.dto';
import { AuthService } from '../authentication/auth.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatMessagesService extends BaseService<ChatMessage> {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
    @Inject(ChatRoomsService)
    private readonly chatRoomsService: ChatRoomsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {
    super(chatMessagesRepository);
  }

  clientUser = {};

  async identify(name: string, clientId: string) {
    this.clientUser[clientId] = name;
    return Object.values(this.clientUser);
  }

  async getClientName(clientId: string) {
    return this.clientUser[clientId];
  }

  async createNewMessage(createMessageDto: CreateMessageDTO) {
    const chatRoom = await this.chatRoomsService.getOne(
      createMessageDto.chatRoom,
    );

    const user = await this.usersService.getOne(
      await this.authService.getUserIdByAccessToken(createMessageDto.token),
    );

    const newMessage = this.chatMessagesRepository.create({
      user,
      chatRoom,
      type: createMessageDto.type,
      content: createMessageDto.content,
      repliedToMessage: createMessageDto.repliedToMessage,
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
      let groupedList = [
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

  async updateIsReadMessageByChatRoom(userId: string, chatRoomId: string) {
    const chatRoom = await this.chatRoomsService.getOne(chatRoomId);
    if (!chatRoom) throw new NotFoundException('Chat room cannot be found!');

    return await this.chatMessagesRepository
      .update(
        {
          user: {
            id: Not(userId),
          },
        },
        { isRead: true },
      )
      .then(() => this.chatRoomsService.getOne(chatRoomId));
  }
}
