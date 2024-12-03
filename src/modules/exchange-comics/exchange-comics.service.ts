import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ExchangeComics } from 'src/entities/exchange-comics.entity';
import { Repository } from 'typeorm';
import { ExchangesService } from '../exchanges/exchanges.service';
import { UsersService } from '../users/users.service';
import { ComicsExchangeService } from '../comics/comics.exchange.service';
import { CreateExchangeDTO } from './dto/exchange-comics.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';

@Injectable()
export class ExchangeComicsService extends BaseService<ExchangeComics> {
  constructor(
    @InjectRepository(ExchangeComics)
    private readonly exchangeComicsRepository: Repository<ExchangeComics>,
    private readonly exchangesService: ExchangesService,
    private readonly usersService: UsersService,
    private readonly comicsService: ComicsExchangeService,
  ) {
    super(exchangeComicsRepository);
  }

  async createRequestOnExchange(userId: string, dto: CreateExchangeDTO) {
    const user = await this.usersService.getOne(userId);
    const exchange = await this.exchangesService.createNewExchange(
      userId,
      dto.postId,
    );

    const requestUserComicsList = await Promise.all(
      dto.requestUserComicsList.map(async (comicsId: string) => {
        const comics = await this.comicsService.getOne(comicsId);
        if (!comics)
          throw new NotFoundException(`Comics ${comicsId} cannot be found!`);
        return comics;
      }),
    );

    const createdExchangeComicsForRequestUser = await Promise.all(
      requestUserComicsList.map(async (comics: Comic) => {
        return this.exchangeComicsRepository.create({
          exchange,
          user,
          comics,
        });
      }),
    );

    const postUserComicsList = await Promise.all(
      dto.postUserComicsList.map(async (comicsId: string) => {
        const comics = await this.comicsService.getOne(comicsId);
        if (!comics)
          throw new NotFoundException(`Comics ${comicsId} cannot be found!`);
        return comics;
      }),
    );

    const createdExchangeComicsForPostUser = await Promise.all(
      postUserComicsList.map(async (comics: Comic) => {
        return this.exchangeComicsRepository.create({
          exchange,
          user: exchange.post.user,
          comics,
        });
      }),
    );

    const newRequestUserList = await Promise.all(
      createdExchangeComicsForRequestUser.map(
        async (exchangeComics) =>
          await this.exchangeComicsRepository.save(exchangeComics),
      ),
    );

    const newPostUserList = await Promise.all(
      createdExchangeComicsForPostUser.map(
        async (exchangeComics) =>
          await this.exchangeComicsRepository.save(exchangeComics),
      ),
    );

    return {
      exchange: exchange,
      requestUserList: newRequestUserList,
      postUserList: newPostUserList,
    };
  }

  async getByExchange(userId: string, exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (!exchange.requestUser)
      throw new BadRequestException(
        'This post did not get any exchange requests yet!',
      );

    const requestUserList = await this.exchangeComicsRepository.find({
      where: {
        exchange: { id: exchangeId },
        user: { id: exchange.requestUser.id },
      },
      relations: ['comics'],
    });

    const postUserList = await this.exchangeComicsRepository.find({
      where: {
        exchange: { id: exchangeId },
        user: { id: exchange.post.user.id },
      },
      relations: ['comics'],
    });

    return {
      exchange,
      isRequestUser: exchange.requestUser.id === userId,
      requestUserList,
      postUserList,
    };
  }

  async getComicsListByUserAndExchange(userId: string, exchangeId: string) {
    const exchangeComics = await this.exchangeComicsRepository.find({
      where: { user: { id: userId }, exchange: { id: exchangeId } },
      relations: ['comics'],
    });

    return exchangeComics.map((item) => {
      return item.comics;
    });
  }

  async completeExchangeComics(exchangeId: string) {
    const exchangeComicsList = await this.exchangeComicsRepository.find({
      where: {
        exchange: { id: exchangeId },
      },
      relations: ['comics'],
    });

    await Promise.all(
      exchangeComicsList.map(async (items) => {
        await this.comicsService.updateStatus(
          items.comics.id,
          ComicsStatusEnum.SOLD,
        );
      }),
    );

    return {
      message: `Updated ${exchangeComicsList.length} exchange comics to SUCCESSFULLY EXCHANGED!`,
    };
  }

  async rejectAndUpdateStatusByExchange(userId: string, exchangeId: string) {
    await this.exchangesService.rejectExchangeRequest(userId, exchangeId);
    await this.updateComicsToInitStatus(exchangeId);
    return {
      message: 'Exchange rejected!',
    };
  }

  async updateComicsToInitStatus(exchangeId: string) {
    const exchangeComicsList = await this.exchangeComicsRepository.find({
      where: {
        exchange: { id: exchangeId },
      },
      relations: ['comics'],
    });

    await Promise.all(
      exchangeComicsList.map(async (items) => {
        await this.comicsService.updateStatus(
          items.comics.id,
          ComicsStatusEnum.AVAILABLE,
        );
      }),
    );
  }
}
