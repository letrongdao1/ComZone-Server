import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Exchange } from 'src/entities/exchange.entity';
import { Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ComicService } from '../comics/comics.service';
import {
  AcceptDealingExchangeDTO,
  CreateExchangePostDTO,
  UpdateOfferedComicsDTO,
} from './dto/exchange.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { ExchangeStatusEnum } from './dto/exchange-status.enum';
import { ExchangeComicsDTO } from '../comics/dto/exchange-comics.dto';
import { ComicsExchangeService } from '../comics/comics.exchange.service';

@Injectable()
export class ExchangesService extends BaseService<Exchange> {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
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
        status: ExchangeStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        requestUser: {
          followerCount: 'DESC',
        },
      },
    });

    return await Promise.all(
      exchanges.map(async (exchange: Exchange) => {
        return {
          ...exchange,
          userOfferedComics:
            await this.comicsExchangeService.findOfferedExchangeComicsByUser(
              exchange.requestUser.id,
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
      chosenList.some(
        (comics) => comics.sellerId.id === exchange.requestUser.id,
      ),
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

    const requestComics: Comic[] = await Promise.all(
      createExchangePostDto.requestedComics.map(
        async (comicsDto: ExchangeComicsDTO) => {
          return await this.comicsService.createExchangeComics(
            userId,
            comicsDto,
            ComicsStatusEnum.EXCHANGE,
          );
        },
      ),
    );

    const newExchangePost = this.exchangesRepository.create({
      requestUser: user,
      requestComics,
      postContent: createExchangePostDto.postContent,
    });

    return await this.exchangesRepository.save(newExchangePost);
  }

  async getAvailableExchangePosts(userId: string) {
    const exchanges = await this.exchangesRepository.find({
      where: {
        requestUser: {
          id: Not(userId),
        },
        status: ExchangeStatusEnum.AVAILABLE,
      },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
        requestUser: {
          followerCount: 'DESC',
        },
      },
    });

    return await Promise.all(
      exchanges.map(async (exchange: Exchange) => {
        return {
          ...exchange,
          userOfferedComics:
            await this.comicsExchangeService.findOfferedExchangeComicsByUser(
              exchange.requestUser.id,
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
      chosenList.some(
        (comics) => comics.sellerId.id === exchange.requestUser.id,
      ),
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
        status: ComicsStatusEnum.EXCHANGE,
      })
      .andWhere('seller.id != :userId', {
        userId,
      })
      .getMany();
  }

  async getAllExchangePostsOfUser(userId: string) {
    return await this.exchangesRepository.find({
      where: { requestUser: { id: userId } },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async getAllExchangeThatUserOffered(userId: string) {
    return await this.exchangesRepository.find({
      where: { offerUser: { id: userId } },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async acceptDealingAnExchange(
    userId: string,
    acceptDealingExchangeDto: AcceptDealingExchangeDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const exchange = await this.getOne(acceptDealingExchangeDto.exchange);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (exchange.requestUser.id !== userId) throw new ForbiddenException();

    const offerUser = await this.usersService.getOne(
      acceptDealingExchangeDto.offerUser,
    );
    if (!offerUser) throw new NotFoundException('Offer user cannot be found!');

    return await this.exchangesRepository
      .update(exchange.id, {
        offerUser: offerUser,
        status: ExchangeStatusEnum.DEALING,
      })
      .then(() => this.getOne(exchange.id));
  }

  async updateOfferForAnExchange(
    updateOfferedComicsDto: UpdateOfferedComicsDTO,
  ) {
    const exchange = await this.getOne(updateOfferedComicsDto.exchange);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const offerComics: Comic[] = await Promise.all(
      updateOfferedComicsDto.offeredComics.map(async (comicsId: string) => {
        const foundComics = await this.comicsService.findOne(comicsId);
        if (!foundComics)
          throw new NotFoundException('Comics cannot be found!');

        if (foundComics.sellerId.id === exchange.requestUser.id)
          throw new BadRequestException(
            "Cannot offer self's exchange request!",
          );

        if (
          exchange.offerComics &&
          exchange.offerComics.some((comics) => comics.id === comicsId)
        )
          throw new ConflictException(
            `Comics with id ${comicsId} has already been used to offer this exchange!`,
          );

        if (foundComics.status !== ComicsStatusEnum.EXCHANGE_OFFER)
          throw new BadRequestException(
            `Comics with id ${comicsId} is not used for exchange offering purposes!`,
          );
        return foundComics;
      }),
    );

    const updatedExchange = {
      ...exchange,
      offerUser: offerComics[0].sellerId,
      offerComics,
    };

    return await this.exchangesRepository
      .save(updatedExchange)
      .then(() => this.getOne(updateOfferedComicsDto.exchange));
  }

  async softDeleteExchangePost(userId: string, exchangeId: string) {
    const exchange = await this.getOne(exchangeId);
    if (userId !== exchange.requestUser.id)
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
      status: ExchangeStatusEnum.REMOVED,
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
          status: ComicsStatusEnum.EXCHANGE,
        });
      }),
    );
    await this.exchangesRepository.update(exchangeId, {
      status: ExchangeStatusEnum.AVAILABLE,
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
