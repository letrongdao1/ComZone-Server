import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Delivery } from 'src/entities/delivery.entity';
import { Repository } from 'typeorm';
import { ExchangeRequestsService } from '../exchange-requests/exchange-requests.service';
import { ExchangeOffersService } from '../exchange-offers/exchange-offers.service';
import { OrdersService } from '../orders/orders.service';
import { CreateDeliveryDTO } from './dto/create-delivery.dto';
import { Order } from 'src/entities/orders.entity';
import { ExchangeRequest } from 'src/entities/exchange-request.entity';
import { ExchangeOffer } from 'src/entities/exchange-offer.entity';

@Injectable()
export class DeliveriesService extends BaseService<Delivery> {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
    @Inject(OrdersService)
    private readonly ordersService: OrdersService,
    @Inject(ExchangeRequestsService)
    private readonly exchangeRequestsService: ExchangeRequestsService,
    @Inject(ExchangeOffersService)
    private readonly exchangeOffersService: ExchangeOffersService,
  ) {
    super(deliveriesRepository);
  }

  async createNewDelivery(dto: CreateDeliveryDTO) {
    let order: Order;
    if (dto.order) order = await this.ordersService.getOne(dto.order);
    if (!order) throw new NotFoundException();

    let exchangeRequest: ExchangeRequest;
    if (dto.exchangeRequest)
      exchangeRequest = await this.exchangeRequestsService.getOne(
        dto.exchangeRequest,
      );
    if (!exchangeRequest) throw new NotFoundException();

    let exchangeOffer: ExchangeOffer;
    if (dto.exchangeOffer)
      exchangeOffer = await this.exchangeOffersService.getOne(
        dto.exchangeOffer,
      );
    if (!exchangeOffer) throw new NotFoundException();

    
  }
}
