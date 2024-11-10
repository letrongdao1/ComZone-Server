import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ExchangeRequest } from 'src/entities/exchange-request.entity';
import { Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ComicService } from '../comics/comics.service';
import { CreateExchangePostDTO } from './dto/exchange-request.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { ExchangeRequestStatusEnum } from './dto/exchange-request-status.enum';
import { ExchangeComicsDTO } from '../comics/dto/exchange-comics.dto';
import { ComicsExchangeService } from '../comics/comics.exchange.service';

@Injectable()
export class ExchangeRequestsService extends BaseService<ExchangeRequest> {
  constructor(
    @InjectRepository(ExchangeRequest)
    private readonly exchangesRepository: Repository<ExchangeRequest>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(ComicsExchangeService)
    private readonly comicsExchangeService: ComicsExchangeService,
  ) {
    super(exchangesRepository);
  }

  async getAvailableExchangePostsAsGuest() {
    const exchanges = await this.exchangesRepository.find({
      where: {
        status: ExchangeRequestStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        user: {
          followerCount: 'DESC',
        },
      },
    });

    return await Promise.all(
      exchanges.map(async (exchange: ExchangeRequest) => {
        return {
          ...exchange,
          userOfferedComics:
            await this.comicsExchangeService.findOfferedExchangeComicsByUser(
              exchange.user.id,
              true,
            ),
        };
      }),
    );
  }

  async getSearchedExchangesAsGuest(key: string) {
    let chosenList: Comic[];
    const exchangeList = await this.getAvailableExchangePostsAsGuest();
    const searchedComicsByTitleAndAuthor =
      await this.comicsExchangeService.searchExchangeOfferComicsByTitleAndAuthor(
        key,
      );
    if (searchedComicsByTitleAndAuthor.length === 0) {
      chosenList =
        await this.comicsExchangeService.searchExchangeOfferComicsByDescription(
          key,
        );
    } else {
      chosenList = searchedComicsByTitleAndAuthor;
    }

    const filteredExchangeList = exchangeList.filter((exchange) =>
      chosenList.some((comics) => comics.sellerId.id === exchange.user.id),
    );
    return {
      count: filteredExchangeList.length,
      data: filteredExchangeList,
    };
  }

  async createExchangePost(
    userId: string,
    createExchangePostDto: CreateExchangePostDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const availableOfferComics =
      await this.comicsExchangeService.findOfferedExchangeComicsByUser(
        user.id,
        false,
      );

    if (!availableOfferComics && availableOfferComics.length === 0)
      throw new ForbiddenException(
        'This user must have at least 1 offer comics to create new exchange request!',
      );

    const requestComics: Comic[] = await Promise.all(
      createExchangePostDto.requestedComics.map(
        async (comicsDto: ExchangeComicsDTO) => {
          return await this.comicsService.createExchangeComics(
            userId,
            comicsDto,
            ComicsStatusEnum.EXCHANGE_REQUEST,
          );
        },
      ),
    );

    const newExchangePost = this.exchangesRepository.create({
      user: user,
      requestComics,
      postContent: createExchangePostDto.postContent,
    });

    return await this.exchangesRepository.save(newExchangePost);
  }

  async getAvailableExchangePosts(userId: string) {
    const exchanges = await this.exchangesRepository.find({
      where: {
        user: {
          id: Not(userId),
        },
        status: ExchangeRequestStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        user: {
          followerCount: 'DESC',
        },
      },
    });

    return await Promise.all(
      exchanges.map(async (exchange: ExchangeRequest) => {
        return {
          ...exchange,
          userOfferedComics:
            await this.comicsExchangeService.findOfferedExchangeComicsByUser(
              exchange.user.id,
              true,
            ),
        };
      }),
    );
  }

  async getSearchedExchanges(userId: string, key: string) {
    if (!key || key.length === 0)
      return await this.getAvailableExchangePosts(userId);

    let chosenList: Comic[];
    const exchangeList = await this.getAvailableExchangePosts(userId);
    const searchedComicsByTitleAndAuthor =
      await this.comicsExchangeService.searchExchangeOfferComicsByTitleAndAuthor(
        key,
      );
    if (searchedComicsByTitleAndAuthor.length === 0) {
      chosenList =
        await this.comicsExchangeService.searchExchangeOfferComicsByDescription(
          key,
        );
    } else {
      chosenList = searchedComicsByTitleAndAuthor;
    }

    const filteredExchangeList = exchangeList.filter((exchange) =>
      chosenList.some((comics) => comics.sellerId.id === exchange.user.id),
    );
    return {
      count: filteredExchangeList.length,
      data: filteredExchangeList,
    };
  }

  async getSearchExchangesByOwned(userId: string, key: string) {
    if (!key || key.length === 0)
      return await this.getAvailableExchangePosts(userId);

    const userOfferedComics =
      await this.comicsExchangeService.findOfferedExchangeComicsByUser(
        userId,
        false,
      );

    if (!userOfferedComics || userOfferedComics.length === 0)
      throw new NotFoundException(
        'User does not have any comics to offer the exchange!',
      );

    return await this.exchangesRepository
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.requestComics', 'reqComics')
      .leftJoinAndSelect('reqComics.sellerId', 'seller')
      .where('LOWER(reqComics.title) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .orWhere('LOWER(reqComics.author) LIKE :key', {
        key: `%${key.toLowerCase()}%`,
      })
      .andWhere('reqComics.status = :status', {
        status: ComicsStatusEnum.EXCHANGE_REQUEST,
      })
      .andWhere('seller.id != :userId', {
        userId,
      })
      .getMany();
  }

  async getAllExchangePostsOfUser(userId: string) {
    return await this.exchangesRepository.find({
      where: { user: { id: userId } },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async updateStatus(requestId: string, status: ExchangeRequestStatusEnum) {
    return await this.exchangesRepository
      .update(requestId, {
        status,
      })
      .then(() => this.getOne(requestId));
  }

  async softDeleteExchangePost(userId: string, exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (userId !== exchange.user.id)
      throw new ForbiddenException(
        `This exchange does not belong to user ${userId}`,
      );
    await Promise.all(
      exchange.requestComics.map(async (comics) => {
        await this.comicsService.update(comics.id, {
          status: ComicsStatusEnum.REMOVED,
        });
      }),
    );
    await this.exchangesRepository.update(exchange.id, {
      status: ExchangeRequestStatusEnum.REMOVED,
    });

    return await this.exchangesRepository.softDelete(exchangeId);
  }

  async undoDelete(exchangeId: string) {
    await this.restore(exchangeId);
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException();

    await Promise.all(
      exchange.requestComics.map(async (comics) => {
        await this.comicsService.update(comics.id, {
          status: ComicsStatusEnum.EXCHANGE_REQUEST,
        });
      }),
    );
    await this.exchangesRepository.update(exchangeId, {
      status: ExchangeRequestStatusEnum.AVAILABLE,
    });
    return this.getOne(exchangeId);
  }

  async remove(exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (!exchange) throw new NotFoundException();

    await Promise.all(
      exchange.requestComics.map(async (comics) => {
        await this.comicsService.remove(comics.id);
      }),
    );

    return await this.exchangesRepository.delete(exchangeId);
  }
}
