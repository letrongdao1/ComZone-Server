import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Exchange } from 'src/entities/exchange.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ComicService } from '../comics/comics.service';
import { CreateExchangePostDTO } from './dto/exchange.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';

@Injectable()
export class ExchangesService extends BaseService<Exchange> {
  constructor(
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
  ) {
    super(exchangesRepository);
  }

  async createExchangePost(
    userId: string,
    createExchangePostDto: CreateExchangePostDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const requestedComicsList: Comic[] = await Promise.all(
      createExchangePostDto.requestedComics.map(async (comicsId: string) => {
        const foundComics = await this.comicsService.findOne(comicsId);
        if (foundComics.status !== ComicsStatusEnum.EXCHANGE)
          throw new BadRequestException(
            `Comics with id ${comicsId} is not used for exchanging purposes!`,
          );
        return foundComics;
      }),
    );

    return requestedComicsList;
  }
}
