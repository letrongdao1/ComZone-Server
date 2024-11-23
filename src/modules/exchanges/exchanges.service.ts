import {
  BadRequestException,
  ForbiddenException,
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

@Injectable()
export class ExchangesService extends BaseService<Exchange> {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
    @InjectRepository(ExchangeComics)
    private readonly comicsRepository: Repository<ExchangeComics>,
    @InjectRepository(ExchangeConfirmation)
    private readonly excConfirmationRepository: Repository<ExchangeConfirmation>,
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,

    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ExchangePostsService)
    private readonly postsService: ExchangePostsService,
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,
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
              status: ExchangeStatusEnum.PENDING,
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
          return await this.exchangesRepository.find({
            where: [
              {
                post: { user: { id: userId } },
                status: ExchangeStatusEnum.DELIVERED,
              },
              {
                requestUser: { id: userId },
                status: ExchangeStatusEnum.DELIVERED,
              },
            ],
            order: { updatedAt: 'DESC' },
          });
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

    return await Promise.all(
      (await getExchangeList()).map(async (exchange) => {
        const exchangeComicsList = await this.comicsRepository.find({
          where: { exchange: { id: exchange.id } },
          select: ['comics'],
          relations: ['comics'],
        });
        return {
          ...exchange,
          myComics: exchangeComicsList.filter(
            (comics) => comics.comics.sellerId.id === userId,
          ),
          othersComics: exchangeComicsList.filter(
            (comics) => comics.comics.sellerId.id !== userId,
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
        await this.exchangesRepository.update(exc.id, {
          status:
            exc.id === exchange.id
              ? ExchangeStatusEnum.DEALING
              : ExchangeStatusEnum.REJECTED,
        });
      }),
    );

    await this.postsService.hidePost(exchange.post.id);

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
      where: { exchange: { id: exchangeId }, from: { user: { id: userId } } },
    });

    if (!userDelivery.deliveryFee)
      throw new NotFoundException('Delivery fee cannot be found!');

    const fullPrice =
      userDelivery.deliveryFee +
      (exchange.compensateUser.id === userId ? exchange.compensationAmount : 0);

    if (user.balance < fullPrice)
      throw new ForbiddenException('Insufficient balance!');

    await this.usersService.updateBalance(userId, -fullPrice);

    await this.transactionsService.createExchangeTransaction(
      userId,
      exchangeId,
      fullPrice,
    );

    await this.exchangesRepository
      .update(exchangeId, {
        status: ExchangeStatusEnum.DELIVERING,
      })
      .then(() => this.getOne(exchangeId));
  }

  async transferCompensationAmount(exchangeId: string) {
    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });

    if (!exchange.compensationAmount || exchange.compensationAmount === 0)
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

    await this.exchangesRepository
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
