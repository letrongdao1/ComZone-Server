import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ExchangeComics } from 'src/entities/exchange-comics.entity';
import { Repository } from 'typeorm';
import { ExchangesService } from '../exchanges/exchanges.service';
import { UsersService } from '../users/users.service';
import { ComicsExchangeService } from '../comics/comics.exchange.service';
import { UpdateRequestOnExchangeDTO } from './dto/exchange-comics.dto';
import { Comic } from 'src/entities/comics.entity';

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

  async createRequestOnExchange(
    userId: string,
    dto: UpdateRequestOnExchangeDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    const exchange = await this.exchangesService.getOne(dto.exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const requestUserComicsList = await Promise.all(
      dto.requestUserComicsList.map(async (comicsId: string) => {
        const comics = await this.comicsService.getOne(comicsId);
        if (!comics)
          throw new NotFoundException(`Comics ${comicsId} cannot be found!`);
        return comics;
      }),
    );

    const createdExchangeComicsForRequestUser = requestUserComicsList.map(
      (comics: Comic) => {
        return this.exchangeComicsRepository.create({
          exchange,
          user,
          comics,
        });
      },
    );

    const postUserComicsList = await Promise.all(
      dto.postUserComicsList.map(async (comicsId: string) => {
        const comics = await this.comicsService.getOne(comicsId);
        if (!comics)
          throw new NotFoundException(`Comics ${comicsId} cannot be found!`);
        return comics;
      }),
    );

    const createdExchangeComicsForPostUser = postUserComicsList.map(
      (comics: Comic) => {
        return this.exchangeComicsRepository.create({
          exchange,
          user: exchange.postUser,
          comics,
        });
      },
    );

    await Promise.all(
      createdExchangeComicsForRequestUser.map(
        async (exchangeComics) =>
          await this.exchangeComicsRepository.save(exchangeComics),
      ),
    );

    await Promise.all(
      createdExchangeComicsForPostUser.map(
        async (exchangeComics) =>
          await this.exchangeComicsRepository.save(exchangeComics),
      ),
    );

    return await this.exchangesService.updateRequestUser(userId, exchange.id);
  }
}
