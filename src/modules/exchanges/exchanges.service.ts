import {
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
import { CreateExchangeDTO, ExchangeDealsDTO } from './dto/create-exchange.dto';
import { ComicsExchangeService } from '../comics/comics.exchange.service';
import { ExchangeStatusEnum } from './dto/exchange-status-enum';
import { StatusQueryEnum } from './dto/status-query.enum';

@Injectable()
export class ExchangesService extends BaseService<Exchange> {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
    @Inject(UsersService)
    private readonly usersService: UsersService,
  ) {
    super(exchangesRepository);
  }

  async createNewExchange(userId: string, dto: CreateExchangeDTO) {
    const user = await this.usersService.getOne(userId);
    const newExchange = this.exchangesRepository.create({
      postUser: user,
      postContent: dto.postContent,
      images: dto.images,
    });
    return await this.exchangesRepository.save(newExchange);
  }

  shuffle(array: Exchange[]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getAllPendingExchanges() {
    const exchanges = await this.exchangesRepository.find({
      where: { status: ExchangeStatusEnum.PENDING },
    });

    return this.shuffle(exchanges);
  }

  async getSearchedPosts(key: string) {
    if (!key || key.length === 0) return await this.getAllPendingExchanges();

    return await this.exchangesRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.postUser', 'postUser')
      .where(
        'LOWER(exchange.postContent) LIKE :key AND exchange.status = :status',
        {
          key: `%${key.toLowerCase()}%`,
          status: ExchangeStatusEnum.PENDING,
        },
      )
      .orderBy('exchange.updatedAt')
      .getMany();
  }

  async getByStatusQuery(userId: string, query: StatusQueryEnum) {
    switch (query) {
      case StatusQueryEnum.ALL: {
        return await this.exchangesRepository.find({
          where: [
            {
              requestUser: { id: userId },
            },
            {
              postUser: { id: userId },
            },
          ],
        });
      }
      case StatusQueryEnum.PENDING_REQUEST: {
        return await this.exchangesRepository.find({
          where: {
            postUser: { id: userId },
            requestUser: Not(IsNull()),
          },
        });
      }
      case StatusQueryEnum.SENT_REQUEST:
      case StatusQueryEnum.IN_PROGRESS:
      case StatusQueryEnum.IN_DELIVERY:
      case StatusQueryEnum.FINISHED_DELIVERY:
      case StatusQueryEnum.SUCCESSFUL:
      case StatusQueryEnum.CANCELED:
    }
  }

  async updateDeals(userId: string, exchangeId: string, dto: ExchangeDealsDTO) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (!exchange.requestUser || exchange.requestUser.id !== userId)
      throw new ForbiddenException(
        'Only the request user can propose new deals!',
      );

    return await this.exchangesRepository.update(exchangeId, {
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
}
