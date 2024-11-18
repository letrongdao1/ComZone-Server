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
import { ExchangeOffer } from 'src/entities/exchange-offer.entity';
import { Repository } from 'typeorm';
import { ExchangeRequestsService } from '../exchange-requests/exchange-requests.service';
import { CreateExchangeOfferDTO } from './dto/exchange-offer.dto';
import { UsersService } from '../users/users.service';
import { ComicService } from '../comics/comics.service';
import { ExchangeOfferStatusEnum } from './dto/exchange-offer-status.dto';
import { ExchangeRequestStatusEnum } from '../exchange-requests/dto/exchange-request-status.enum';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { ComicsExchangeService } from '../comics/comics.exchange.service';

@Injectable()
export class ExchangeOffersService extends BaseService<ExchangeOffer> {
  constructor(
    @InjectRepository(ExchangeOffer)
    private readonly exchangeOffersRepository: Repository<ExchangeOffer>,
    @Inject(ExchangeRequestsService)
    private readonly exchangeRequestsService: ExchangeRequestsService,
    @Inject(UsersService)
    private readonly usersService: UsersService,
    @Inject(ComicService)
    private readonly comicsService: ComicService,
    @Inject(ComicsExchangeService)
    private readonly comicsExchangeService: ComicsExchangeService,
  ) {
    super(exchangeOffersRepository);
  }

  async getOne(id: string): Promise<ExchangeOffer> {
    return await this.exchangeOffersRepository.findOne({
      where: {
        id,
      },
      relations: ['exchangeRequest', 'user', 'offerComics'],
    });
  }

  async createNewExchangeOffer(userId: string, dto: CreateExchangeOfferDTO) {
    // console.log(dto);
    // console.log(userId);
    // const user = await this.usersService.getOne(userId);
    // const exchangeRequest = await this.exchangeRequestsService.getOne(
    //   dto.exchangeRequest,
    // );
    // console.log(exchangeRequest);
    // if (!exchangeRequest)
    //   throw new NotFoundException('Exchange request cannot be found!');
    // if (userId === exchangeRequest.user.id)
    //   throw new BadRequestException("Cannot offer self's exchange request!");
    // const foundUserOffer = await this.exchangeOffersRepository.findOne({
    //   where: {
    //     user: { id: userId },
    //     exchangeRequest: { id: dto.exchangeRequest },
    //   },
    // });
    // if (foundUserOffer) {
    //   console.log(foundUserOffer);
    //   throw new ConflictException(
    //     'This user has already made an offer for this request! Try updating instead!',
    //   );
    // }
    // const offerComics = await Promise.all(
    //   dto.offerComics.map(async (comicsId: string) => {
    //     const comics = await this.comicsService.findOne(comicsId);
    //     if (!comics) throw new NotFoundException('Comics cannot be found!');
    //     if (comics.sellerId.id !== userId)
    //       throw new BadRequestException(
    //         `Comics ${comicsId} does not belong to this user!`,
    //       );
    //     if (comics.status !== ComicsStatusEnum.EXCHANGE_OFFER)
    //       throw new BadRequestException(
    //         `Comics ${comicsId} is not used to offer any exchanges!`,
    //       );
    //     return comics;
    //   }),
    // );
    // const newOffer = this.exchangeOffersRepository.create({
    //   exchangeRequest,
    //   user,
    //   offerComics,
    //   compensationAmount: dto.compensationAmount || 0,
    //   status: 'PENDING',
    // });
    // return await this.exchangeOffersRepository.save(newOffer);
  }

  async getByExchangeRequest(requestId: string) {
    const request = await this.exchangeRequestsService.getOne(requestId);
    if (!request)
      throw new NotFoundException('Exchange request cannot be found!');

    return await this.exchangeOffersRepository.find({
      where: {
        exchangeRequest: {
          id: requestId,
        },
      },
      relations: ['exchangeRequest', 'user', 'offerComics'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getByExchangeRequestAndOfferUser(userId: string, requestId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const request = await this.exchangeRequestsService.getOne(requestId);
    if (!request)
      throw new NotFoundException('Exchange request cannot be found!');

    return await this.exchangeOffersRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        exchangeRequest: {
          id: requestId,
        },
      },
      relations: ['exchangeRequest', 'user', 'offerComics'],
    });
  }

  async getExchangeOfferComicsByUser(userId: string) {
    // return await this.comicsExchangeService.findOfferedExchangeComicsByUser(
    //   userId,
    //   false,
    // );
  }

  async updateSeenStatus(offerId: string) {
    return await this.exchangeOffersRepository
      .update(offerId, {
        status: ExchangeOfferStatusEnum.SEEN,
      })
      .then(() => this.getOne(offerId));
  }

  async updateStatus(
    userId: string,
    offerId: string,
    status: ExchangeOfferStatusEnum,
  ) {
    const exchangeOffer = await this.getOne(offerId);
    if (!exchangeOffer)
      throw new NotFoundException('Exchange offer cannot be found!');

    if (exchangeOffer.exchangeRequest.user.id !== userId)
      throw new ForbiddenException(
        'Only the request user can accept or reject to this offer!',
      );

    if (status === ExchangeOfferStatusEnum.ACCEPTED) {
      await this.exchangeOffersRepository.update(
        {
          exchangeRequest: {
            id: exchangeOffer.exchangeRequest.id,
          },
        },
        {
          status: ExchangeOfferStatusEnum.REJECTED,
        },
      );
    }

    await this.exchangeRequestsService.updateStatus(
      exchangeOffer.exchangeRequest.id,
      status === ExchangeOfferStatusEnum.ACCEPTED
        ? ExchangeRequestStatusEnum.DEALING
        : ExchangeRequestStatusEnum.AVAILABLE,
    );

    return await this.exchangeOffersRepository
      .update(offerId, {
        status,
      })
      .then(() => this.getOne(offerId));
  }
}
