import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange } from 'src/entities/exchange.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { BaseService } from 'src/common/service.base';
import { ExchangeDealsDTO } from './dto/create-exchange.dto';
import { ExchangeStatusEnum } from './dto/exchange-status-enum';
import { StatusQueryEnum } from './dto/status-query.enum';
import { ExchangePostsService } from '../exchange-posts/exchange-posts.service';
import { ExchangeComics } from 'src/entities/exchange-comics.entity';
import { TransactionsService } from '../transactions/transactions.service';
import { Delivery } from 'src/entities/delivery.entity';
import { ExchangeConfirmation } from 'src/entities/exchange-confirmation.entity';
import { OrderDeliveryStatusEnum } from '../orders/dto/order-delivery-status.enum';
import { ComicService } from '../comics/comics.service';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { DeliveriesService } from '../deliveries/deliveries.service';
import { EventsGateway } from '../socket/event.gateway';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import CurrencySplitter from 'src/utils/currency-spliter/CurrencySplitter';

@Injectable()
export class ExchangesService extends BaseService<Exchange> {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
    @InjectRepository(ExchangeComics)
    private readonly exchangeComicsRepository: Repository<ExchangeComics>,
    @InjectRepository(ExchangeConfirmation)
    private readonly excConfirmationRepository: Repository<ExchangeConfirmation>,
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,

    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ComicService)
    private readonly comicsService: ComicService,
    @Inject(ExchangePostsService)
    private readonly postsService: ExchangePostsService,
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => DeliveriesService))
    private readonly deliveriesService: DeliveriesService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {
    super(exchangesRepository);
  }

  async createNewExchange(userId: string, postId: string) {
    const user = await this.usersService.getOne(userId);
    const post = await this.postsService.getOne(postId);

    const newExchange = this.exchangesRepository.create({
      post: post,
      requestUser: user,
    });
    return await this.exchangesRepository.save(newExchange);
  }

  async getByStatusQuery(userId: string, query: StatusQueryEnum) {
    const getExchangeList = async () => {
      switch (query) {
        case StatusQueryEnum.ALL: {
          return await this.exchangesRepository.find({
            where: [
              {
                requestUser: { id: userId },
              },
              {
                post: { user: { id: userId } },
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.PENDING_REQUEST: {
          return await this.exchangesRepository.find({
            where: {
              post: { user: { id: userId } },
              requestUser: Not(IsNull()),
              status: ExchangeStatusEnum.PENDING,
            },
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.SENT_REQUEST: {
          return await this.exchangesRepository.find({
            where: {
              requestUser: { id: userId },
            },
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.IN_PROGRESS: {
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.DEALING,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.DEALING,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.IN_DELIVERY: {
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.DELIVERING,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.DELIVERING,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.FINISHED_DELIVERY: {
          const deliveryList = await this.deliveriesRepository.find({
            where: [
              {
                exchange: Not(IsNull()),
                to: { user: { id: userId } },
                status: OrderDeliveryStatusEnum.DELIVERED,
              },
            ],
            relations: [
              'exchange',
              'exchange.post',
              'exchange.post.user',
              'exchange.requestUser',
            ],
            select: ['exchange'],
          });

          return deliveryList.map((delivery) => delivery.exchange);
        }
        case StatusQueryEnum.SUCCESSFUL: {
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.SUCCESSFUL,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.SUCCESSFUL,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.REJECTED: {
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.REJECTED,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.REJECTED,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
        case StatusQueryEnum.FAILED: {
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.FAILED,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.FAILED,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
        }
      }
    };

    const exchangeList = await getExchangeList();
    if (!exchangeList || exchangeList.length === 0) return [];

    return await Promise.all(
      exchangeList.map(async (exchange) => {
        const exchangeComicsList = await this.exchangeComicsRepository.find({
          where: { exchange: { id: exchange.id } },
          relations: ['exchange', 'user', 'comics'],
        });

        return {
          ...exchange,
          myComics: exchangeComicsList.filter(
            (exchangeComics) => exchangeComics.user.id === userId,
          ),
          othersComics: exchangeComicsList.filter(
            (exchangeComics) => exchangeComics.user.id !== userId,
          ),
        };
      }),
    );
  }

  async updateExchangeToDealing(userId: string, exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (exchange.post.user.id !== userId)
      throw new ForbiddenException(
        'Only post user can accept requests on this post!',
      );

    const exchangesOnPost = await this.exchangesRepository.find({
      where: { post: { id: exchange.post.id } },
    });

    await Promise.all(
      exchangesOnPost.map(async (exc) => {
        if (exc.id === exchange.id) {
          await this.exchangesRepository.update(exc.id, {
            status: ExchangeStatusEnum.DEALING,
          });
        } else {
          await this.rejectExchangeRequest(exc.post.user.id, exc.id);
        }
      }),
    );

    await this.postsService.hidePost(exchange.post.id);

    const comicsList = await this.exchangeComicsRepository.findBy({
      exchange: { id: exchangeId },
    });

    await Promise.all(
      comicsList.map(async (exchangeComics) => {
        await this.comicsService.updateStatus(
          exchangeComics.comics.id,
          ComicsStatusEnum.PRE_ORDER,
        );
      }),
    );

    await this.eventsGateway.notifyUser(
      exchange.requestUser.id,
      `Giờ đây bạn có thể tiến hành trao đổi truyện với "${exchange.post.user.name}". Hãy sử dụng chat và luôn nắm được tiến độ trao đổi để cuộc trao đổi được diễn ra thuận tiện!`,
      { exchangeId: exchange.id },
      'Yêu cầu trao đổi của bạn đã được chấp nhận',
      AnnouncementType.EXCHANGE_APPROVED,
      RecipientType.USER,
    );

    return await this.getOne(exchangeId);
  }

  async updateDeals(exchangeId: string, dto: ExchangeDealsDTO) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (exchange.status !== ExchangeStatusEnum.DEALING)
      throw new BadRequestException('Only DEALING exchanges can be updated!');

    const compensateUser = dto.compensateUser
      ? await this.usersService.getOne(dto.compensateUser)
      : null;

    return await this.exchangesRepository.update(exchangeId, {
      compensateUser,
      compensationAmount: dto.compensationAmount,
      depositAmount: dto.depositAmount,
    });
  }

  async updateRequestUser(requestUserId: string, exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const requestUser = await this.usersService.getOne(requestUserId);
    if (!requestUser) throw new NotFoundException('User cannot be found!');

    return await this.exchangesRepository
      .update(exchangeId, {
        requestUser,
      })
      .then(() => this.getOne(exchangeId));
  }

  async payExchangeAmount(userId: string, exchangeId: string) {
    const user = await this.usersService.getOne(userId);

    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const userDelivery = await this.deliveriesRepository.findOne({
      where: { exchange: { id: exchangeId }, to: { user: { id: userId } } },
    });

    if (!userDelivery.deliveryFee)
      throw new NotFoundException('Delivery fee cannot be found!');

    const fullPrice =
      userDelivery.deliveryFee +
      (exchange.compensateUser && exchange.compensateUser.id === userId
        ? exchange.compensationAmount
        : 0);

    if (user.balance < fullPrice)
      throw new ForbiddenException('Insufficient balance!');

    await this.usersService.updateBalance(userId, -fullPrice);

    const transaction =
      await this.transactionsService.createExchangeTransaction(
        userId,
        exchangeId,
        fullPrice,
      );

    await this.eventsGateway.notifyUser(
      userId,
      `Bạn đã thanh toán thành công tổng số tiền ${CurrencySplitter(fullPrice)}đ cho một cuộc trao đổi.`,
      { transactionId: transaction.id },
      'Thanh toán thành công',
      AnnouncementType.TRANSACTION_SUBTRACT,
      RecipientType.USER,
    );

    return await this.getOne(exchangeId);
  }

  async registerGHNDeliveryForExchange(exchangeId: string) {
    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const deliveries = await this.deliveriesRepository.findBy({
      exchange: { id: exchangeId },
    });

    await Promise.all(
      deliveries.map(async (delivery) => {
        await this.deliveriesService.registerNewGHNDelivery(delivery.id);
      }),
    );

    await this.eventsGateway.notifyUser(
      exchange.requestUser.id,
      `Bạn có một cuộc trao đổi đã bắt đầu quá trình giao hàng. Hệ thống sẽ gửi cho bạn thông báo trước khi nhân viên giao hàng đến. Hãy đảm bảo bạn sẽ hoàn tất quá trình đóng gói để bàn giao truyện!`,
      { exchangeId: exchange.id },
      'Bắt đầu giao hàng trao đổi',
      AnnouncementType.EXCHANGE_DELIVERY,
      RecipientType.USER,
    );

    await this.eventsGateway.notifyUser(
      exchange.post.user.id,
      `Bạn có một cuộc trao đổi đã bắt đầu quá trình giao hàng. Hệ thống sẽ gửi cho bạn thông báo trước khi nhân viên giao hàng đến. Hãy đảm bảo bạn sẽ hoàn tất quá trình đóng gói để bàn giao truyện!`,
      { exchangeId: exchange.id },
      'Bắt đầu giao hàng trao đổi',
      AnnouncementType.EXCHANGE_DELIVERY,
      RecipientType.USER,
    );
  }

  async transferCompensationAmount(exchangeId: string) {
    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });

    if (
      !exchange.compensationAmount ||
      exchange.compensationAmount === 0 ||
      exchange.status === ExchangeStatusEnum.FAILED
    )
      return;

    const compensatedUserId =
      exchange.requestUser.id === exchange.compensateUser.id
        ? exchange.post.user.id
        : exchange.requestUser.id;

    await this.usersService.updateBalance(
      compensatedUserId,
      exchange.compensationAmount,
    );

    await this.transactionsService.createExchangeTransaction(
      compensatedUserId,
      exchangeId,
      exchange.compensationAmount,
      'ADD',
    );
  }

  async revertCompensationAmount(exchangeId: string) {
    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });

    if (!exchange.compensationAmount || exchange.compensationAmount === 0)
      return;

    await this.usersService.updateBalance(
      exchange.compensateUser.id,
      exchange.compensationAmount,
    );

    await this.transactionsService.createExchangeTransaction(
      exchange.compensateUser.id,
      exchangeId,
      exchange.compensationAmount,
      'ADD',
    );
  }

  async updateExchangeStatus(exchangeId: string, status: ExchangeStatusEnum) {
    return await this.exchangesRepository
      .update(exchangeId, {
        status,
      })
      .then(() => this.getOne(exchangeId));
  }

  async rejectExchangeRequest(userId: string, exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (exchange.post.user.id !== userId)
      throw new ForbiddenException(
        'Only post user can reject requests on this post!',
      );

    const comicsList = await this.exchangeComicsRepository.find({
      where: { exchange: { id: exchangeId } },
    });

    await Promise.all(
      comicsList.map(async (comics) => {
        await this.comicsService.updateStatus(
          comics.comics.id,
          ComicsStatusEnum.AVAILABLE,
        );
      }),
    );

    await this.eventsGateway.notifyUser(
      exchange.requestUser.id,
      `Yêu cầu trao đổi của bạn có thể đã không đáp ứng được nhu cầu trao đổi truyện của "${exchange.post.user.name}" hoặc họ đã chấp nhận một yêu cầu trao đổi khác.`,
      { exchangeId: exchange.id },
      'Yêu cầu trao đổi của bạn đã bị từ chối',
      AnnouncementType.EXCHANGE_REJECTED,
      RecipientType.USER,
    );

    return await this.exchangesRepository
      .update(exchangeId, {
        status: ExchangeStatusEnum.REJECTED,
      })
      .then(() => this.getOne(exchangeId));
  }

  async deleteExchange(exchangeId: string) {
    const exchange = await this.getOne(exchangeId);

    return await this.exchangesRepository.remove(exchange);
  }
}
