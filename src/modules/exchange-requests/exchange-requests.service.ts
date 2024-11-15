import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { ExchangeRequest } from 'src/entities/exchange-request.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { ComicService } from '../comics/comics.service';
import {
  CreateExchangePostDTO,
  UpdateExchangeSettingsDTO,
} from './dto/exchange-request.dto';
import { Comic } from 'src/entities/comics.entity';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { ExchangeRequestStatusEnum } from './dto/exchange-request-status.enum';
import { ExchangeComicsDTO } from '../comics/dto/exchange-comics.dto';
import { ComicsExchangeService } from '../comics/comics.exchange.service';

@Injectable()
export class ExchangeRequestsService extends BaseService<ExchangeRequest> {
  constructor(
    @InjectRepository(ExchangeRequest)
    private readonly exchangeRequestsRepository: Repository<ExchangeRequest>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(ComicsExchangeService)
    private readonly comicsExchangeService: ComicsExchangeService,
  ) {
    super(exchangeRequestsRepository);
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

    const newExchangePost = this.exchangeRequestsRepository.create({
      user: user,
      requestComics,
      postContent: createExchangePostDto.postContent,
    });

    return await this.exchangeRequestsRepository.save(newExchangePost);
  }

  shuffle(array: ExchangeRequest[]) {
    for (let i = array.length - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getAvailableExchangePosts() {
    const exchanges = await this.exchangeRequestsRepository.find({
      where: {
        status: ExchangeRequestStatusEnum.AVAILABLE,
      },
    });

    return this.shuffle(exchanges);
  }

  async getSearchedExchanges(key: string) {
    if (!key || key.length === 0) return await this.getAvailableExchangePosts();

    const searchedComicsList =
      await this.comicsExchangeService.searchExchangeRequestComicsByTitleAndAuthor(
        key,
      );

    const filteredComicsList = searchedComicsList.filter(
      (comics) => comics.status === ComicsStatusEnum.EXCHANGE_REQUEST,
    );

    return await Promise.all(
      filteredComicsList.map(async (comics: Comic) => {
        return await this.exchangeRequestsRepository.findOne({
          where: {
            requestComics: {
              id: comics.id,
            },
          },
        });
      }),
    );
  }

  async getAllExchangePostsOfUser(userId: string) {
    return await this.exchangeRequestsRepository.find({
      where: { user: { id: userId } },
      order: {
        createdAt: 'DESC',
        updatedAt: 'DESC',
      },
    });
  }

  async updateExchangeSettings(
    requestId: string,
    dto: UpdateExchangeSettingsDTO,
  ) {
    const exchangeRequest = await this.getOne(requestId);
    if (!exchangeRequest)
      throw new NotFoundException('Exchange request cannot be found!');

    return await this.exchangeRequestsRepository
      .update(requestId, {
        depositAmount: dto.depositAmount,
        isDeliverRequired: dto.isDeliveryRequired,
      })
      .then(() => this.getOne(requestId));
  }

  async updateStatus(requestId: string, status: ExchangeRequestStatusEnum) {
    return await this.exchangeRequestsRepository
      .update(requestId, {
        status,
      })
      .then(() => this.getOne(requestId));
  }

  async completeExchangeRequest(
    userId: string,
    exchangeRequestId: string,
    status:
      | ExchangeRequestStatusEnum.SUCCESSFUL
      | ExchangeRequestStatusEnum.FAILED,
  ) {
    const exchangeRequest = await this.exchangeRequestsRepository.findOne({
      where: { id: exchangeRequestId },
      relations: ['user'],
    });

    if (exchangeRequest.user.id !== userId)
      throw new ForbiddenException('Only the requested user can make changes!');

    return await this.exchangeRequestsRepository
      .update(exchangeRequestId, {
        status,
      })
      .then(() => this.getOne(exchangeRequestId));
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
    await this.exchangeRequestsRepository.update(exchange.id, {
      status: ExchangeRequestStatusEnum.REMOVED,
    });

    return await this.exchangeRequestsRepository.softDelete(exchangeId);
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
    await this.exchangeRequestsRepository.update(exchangeId, {
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

    return await this.exchangeRequestsRepository.delete(exchangeId);
  }
}
