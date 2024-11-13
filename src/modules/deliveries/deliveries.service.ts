import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Delivery } from 'src/entities/delivery.entity';
import { Repository } from 'typeorm';
import { ExchangeRequestsService } from '../exchange-requests/exchange-requests.service';
import { ExchangeOffersService } from '../exchange-offers/exchange-offers.service';
import { OrdersService } from '../orders/orders.service';
import {
  CreateExchangeOfferDeliveryDTO,
  CreateExchangeRequestDeliveryDTO,
} from './dto/create-delivery.dto';
import { Order } from 'src/entities/orders.entity';
import { DeliveryInformationService } from '../delivery-information/delivery-information.service';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { VietNamAddressService } from '../viet-nam-address/viet-nam-address.service';
import { OrderDeliveryStatusEnum } from '../orders/dto/order-delivery-status.enum';
import { Comic } from 'src/entities/comics.entity';

dotenv.config();

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
    @Inject(DeliveryInformationService)
    private readonly deliveryInfoService: DeliveryInformationService,
    @Inject(VietNamAddressService)
    private readonly vnAddressService: VietNamAddressService,
  ) {
    super(deliveriesRepository);
  }

  async getOne(id: string): Promise<Delivery> {
    return this.deliveriesRepository.findOne({
      where: { id },
      relations: ['from', 'to'],
    });
  }

  async createExchangeRequestDelivery(dto: CreateExchangeRequestDeliveryDTO) {
    if (!dto.exchangeRequest) return;

    const deliveryInfo = await this.deliveryInfoService.getOne(dto.addressId);
    if (!deliveryInfo)
      throw new NotFoundException('Delivery information cannot be found!');

    const exchangeRequest = await this.exchangeRequestsService.getOne(
      dto.exchangeRequest,
    );
    if (!exchangeRequest)
      throw new NotFoundException('Exchange request cannot be found!');
    const foundRequest = await this.deliveriesRepository.find({
      where: { exchangeRequest: { id: dto.exchangeRequest } },
    });
    if (foundRequest && foundRequest.length === 2)
      throw new ConflictException(
        'Already recorded this delivery information!',
      );

    const checkExisted = await this.deliveriesRepository.find({
      where: {
        exchangeOffer: { exchangeRequest: { id: exchangeRequest.id } },
      },
      relations: ['from', 'to'],
    });

    if (checkExisted.length === 2) {
      const missingFrom = checkExisted.find((value) => value.to);
      const missingTo = checkExisted.find((value) => value.from);

      const from = await this.deliveriesRepository
        .update(missingFrom.id, {
          from: deliveryInfo,
          exchangeRequest,
        })
        .then(() => this.getOne(missingFrom.id));
      const to = await this.deliveriesRepository
        .update(missingTo.id, {
          to: deliveryInfo,
          exchangeRequest,
        })
        .then(() => this.getOne(missingTo.id));

      await this.registerNewGHNDelivery(missingFrom.id);
      await this.registerNewGHNDelivery(missingTo.id);
      return {
        message: 'Successfully created 2 GHN deliveries!',
        data: {
          from,
          to,
        },
      };
    } else {
      const newFrom = this.deliveriesRepository.create({
        exchangeRequest,
        from: deliveryInfo,
      });
      const newTo = this.deliveriesRepository.create({
        exchangeRequest,
        to: deliveryInfo,
      });
      return await this.deliveriesRepository
        .save([newFrom, newTo])
        .then(async () => {
          return {
            first: await this.getOne(newFrom.id),
            second: await this.getOne(newTo.id),
          };
        });
    }
  }

  async createExchangeOfferDelivery(dto: CreateExchangeOfferDeliveryDTO) {
    if (!dto.exchangeOffer) return;

    const deliveryInfo = await this.deliveryInfoService.getOne(dto.addressId);
    if (!deliveryInfo)
      throw new NotFoundException('Delivery information cannot be found!');

    const exchangeOffer = await this.exchangeOffersService.getOne(
      dto.exchangeOffer,
    );
    if (!exchangeOffer)
      throw new NotFoundException('Exchange offer cannot be found!');

    const foundOffer = await this.deliveriesRepository.find({
      where: { exchangeOffer: { id: dto.exchangeOffer } },
    });
    if (foundOffer && foundOffer.length === 2)
      throw new ConflictException(
        'Already recorded this delivery information!',
      );

    const checkExisted = await this.deliveriesRepository.find({
      where: {
        exchangeRequest: {
          exchangeOffers: { id: exchangeOffer.id },
        },
      },
      relations: ['from', 'to'],
    });

    if (checkExisted.length === 2) {
      const missingFrom = checkExisted.find((value) => value.to);
      const missingTo = checkExisted.find((value) => value.from);

      const from = await this.deliveriesRepository
        .update(missingFrom.id, {
          from: deliveryInfo,
          exchangeOffer,
        })
        .then(() => this.getOne(missingFrom.id));
      const to = await this.deliveriesRepository
        .update(missingTo.id, {
          to: deliveryInfo,
          exchangeOffer,
        })
        .then(() => this.getOne(missingTo.id));

      await this.registerNewGHNDelivery(missingTo.id);
      await this.registerNewGHNDelivery(missingFrom.id);
      return {
        message: 'Successfully created 2 GHN deliveries!',
        data: {
          from,
          to,
        },
      };
    } else {
      const newFrom = this.deliveriesRepository.create({
        exchangeOffer,
        from: deliveryInfo,
      });
      const newTo = this.deliveriesRepository.create({
        exchangeOffer,
        to: deliveryInfo,
      });
      return await this.deliveriesRepository
        .save([newFrom, newTo])
        .then(async () => {
          return {
            first: await this.getOne(newFrom.id),
            second: await this.getOne(newTo.id),
          };
        });
    }
  }

  async registerNewGHNDelivery(deliveryId: string) {
    const delivery = await this.deliveriesRepository.findOne({
      where: { id: deliveryId },
      relations: [
        'from',
        'to',
        'exchangeRequest',
        'exchangeRequest.requestComics',
        'exchangeOffer',
        'exchangeOffer.offerComics',
      ],
    });
    if (!delivery) throw new NotFoundException('Delivery cannot be found!');

    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };

    const from = {
      province: await this.vnAddressService.getProvinceById(
        delivery.from.provinceId,
      ),
      district: await this.vnAddressService.getDistrictById(
        delivery.from.provinceId,
        delivery.from.districtId,
      ),
      ward: await this.vnAddressService.getWardById(
        delivery.from.districtId,
        delivery.from.wardId,
      ),
    };

    let comicsList: Comic[];
    if (delivery.order)
      comicsList = delivery.order.orderItem.map((item) => {
        return item.comics;
      });

    if (delivery.exchangeRequest)
      comicsList = delivery.exchangeRequest.requestComics;

    if (delivery.exchangeOffer) comicsList = delivery.exchangeOffer.offerComics;

    const services = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
        {
          shop_id: parseInt(process.env.GHN_SHOPID),
          from_district: delivery.from.districtId,
          to_district: delivery.to.districtId,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        console.log('Error getting available services: ', err.response);
        throw new BadRequestException(err.response.data);
      });

    await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
        {
          payment_type_id: 1,
          required_note: 'CHOXEMHANGKHONGTHU',
          from_name: delivery.from.name,
          from_phone: delivery.from.phone,
          from_address: delivery.from.address,
          from_ward_name: from.ward.name,
          from_district_name: from.district.name,
          from_province_name: from.province.name,
          return_phone: delivery.from.phone,
          return_address: delivery.from.address,
          return_district_id: delivery.from.districtId,
          return_ward_code: delivery.from.wardId,
          to_name: delivery.to.name,
          to_phone: delivery.to.phone,
          to_address: delivery.to.address,
          to_ward_code: delivery.to.wardId,
          to_district_id: delivery.to.districtId,
          cod_amount: 0,
          content: 'Truyện tranh',
          weight: comicsList.length * 500,
          length: 30,
          width: 15,
          height: comicsList.length * 4,
          quantity: comicsList.length,
          pick_station_id: null,
          deliver_station_id: null,
          insurance_value: 0,
          service_id: services[0].service_id,
          service_type_id: services[0].service_type_id,
          coupon: null,
          items: comicsList.map((item) => {
            return {
              code: item.id + '-' + new Date(Date.now()).getTime().toString(),
              name: item.title,
              quantity: item.quantity,
              price: item.price,
              length: 30,
              width: 15,
              height: item.quantity * 4,
              weight: item.quantity * 500,
              category: {
                level1: 'Truyện',
              },
            };
          }),
        },
        { headers },
      )
      .then(async (res) => {
        const data = res.data.data;
        await this.deliveriesRepository.update(deliveryId, {
          deliveryTrackingCode: data.order_code,
          deliveryFee: data.total_fee,
          estimatedDeliveryTime: data.expected_delivery_time,
          status: OrderDeliveryStatusEnum.READY_TO_PICK,
        });
      })
      .catch((err) => {
        console.log('Error creating GHN delivery: ', err.response);
        throw new BadRequestException(err.response.data);
      });
  }
}
