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
import {
  CreateExchangeDeliveryDTO,
  CreateOrderDeliveryDTO,
} from './dto/create-delivery.dto';
import { DeliveryInformationService } from '../delivery-information/delivery-information.service';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { VietNamAddressService } from '../viet-nam-address/viet-nam-address.service';
import { OrderDeliveryStatusEnum } from '../orders/dto/order-delivery-status.enum';
import { Comic } from 'src/entities/comics.entity';
import { GetDeliveryFeeDTO } from './dto/get-delivery-fee.dto';
import { Order } from 'src/entities/orders.entity';
import { ExchangeComicsService } from '../exchange-comics/exchange-comics.service';
import { UsersService } from '../users/users.service';
import { DeliveryOverallStatusEnum } from './dto/overall-status.enum';
import { DeliveryInformation } from 'src/entities/delivery-information.entity';
import { Exchange } from 'src/entities/exchange.entity';
import { EventsGateway } from '../socket/event.gateway';
import {
  Announcement,
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';

dotenv.config();

@Injectable()
export class DeliveriesService extends BaseService<Delivery> {
  constructor(
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,
    @InjectRepository(Announcement)
    private readonly announcementsRepository: Repository<Announcement>,

    private readonly usersService: UsersService,
    @Inject(ExchangeComicsService)
    private readonly exchangeComicsService: ExchangeComicsService,
    @Inject(DeliveryInformationService)
    private readonly deliveryInfoService: DeliveryInformationService,
    @Inject(VietNamAddressService)
    private readonly vnAddressService: VietNamAddressService,
    @Inject(EventsGateway)
    private readonly eventsGateway: EventsGateway,
  ) {
    super(deliveriesRepository);
  }

  async getAll(): Promise<Delivery[]> {
    const deliveries = await this.deliveriesRepository.find({
      order: { updatedAt: 'DESC' },
    });
    await Promise.all(
      deliveries.map(async (delivery) => {
        await this.autoUpdateGHNDeliveryStatus(delivery.id);
      }),
    );
    return deliveries;
  }

  async createOrderDelivery(dto: CreateOrderDeliveryDTO) {
    const fromAddress = await this.deliveryInfoService.getOne(
      dto.fromAddressId,
    );
    if (!fromAddress)
      throw new NotFoundException(
        "Seller's delivery information cannot be found!",
      );

    const toAddress = await this.deliveryInfoService.getOne(dto.toAddressId);
    if (!toAddress)
      throw new NotFoundException(
        "User's delivery information cannot be found!",
      );

    const newDelivery = this.deliveriesRepository.create({
      from: fromAddress,
      to: toAddress,
      deliveryFee: dto.deliveryFee,
    });

    return await this.deliveriesRepository
      .save(newDelivery)
      .then(() => this.getOne(newDelivery.id));
  }

  async createExchangeDelivery(userId: string, dto: CreateExchangeDeliveryDTO) {
    const deliveryInfo = await this.deliveryInfoService.getOne(dto.addressId);
    if (!deliveryInfo)
      throw new NotFoundException('Delivery information cannot be found!');

    const exchange = await this.exchangesRepository.findOneBy({
      id: dto.exchange,
    });
    if (!exchange)
      throw new NotFoundException('Exchange request cannot be found!');

    const foundExchangeDelivery = await this.deliveriesRepository.find({
      where: { exchange: { id: dto.exchange }, from: { user: { id: userId } } },
    });

    if (foundExchangeDelivery && foundExchangeDelivery.length === 2)
      throw new ConflictException(
        'Already recorded this delivery information!',
      );

    const checkExisted = await this.deliveriesRepository.find({
      where: {
        exchange: { id: exchange.id },
      },
      relations: ['from', 'to'],
    });

    if (checkExisted.length === 2) {
      const missingFrom = checkExisted.find((value) => value.to);
      const missingTo = checkExisted.find((value) => value.from);
      const from = await this.deliveriesRepository
        .update(missingFrom.id, {
          from: deliveryInfo,
        })
        .then(() => this.getOne(missingFrom.id));
      const to = await this.deliveriesRepository
        .update(missingTo.id, {
          to: deliveryInfo,
        })
        .then(() => this.getOne(missingTo.id));

      await this.eventsGateway.notifyUser(
        checkExisted[0].from
          ? checkExisted[0].from.user.id
          : checkExisted[1].from.user.id,
        'Bạn có một cuộc trao đổi có thể tiến hành thanh toán ngay!',
        { exchangeId: exchange.id },
        'Thanh toán trao đổi.',
        AnnouncementType.EXCHANGE_PAY_AVAILABLE,
        RecipientType.USER,
      );

      return {
        from,
        to,
      };
    } else {
      const newFrom = this.deliveriesRepository.create({
        exchange,
        from: deliveryInfo,
      });
      const newTo = this.deliveriesRepository.create({
        exchange,
        to: deliveryInfo,
      });
      return await this.deliveriesRepository
        .save([newFrom, newTo])
        .then(async () => {
          return {
            from: await this.getOne(newFrom.id),
            to: await this.getOne(newTo.id),
          };
        });
    }
  }

  async registerNewGHNDelivery(deliveryId: string, orderComicsList?: Comic[]) {
    const delivery = await this.deliveriesRepository.findOne({
      where: { id: deliveryId },
      relations: ['from', 'to', 'order', 'exchange'],
    });
    if (!delivery) throw new NotFoundException('Delivery cannot be found!');

    if (delivery.deliveryTrackingCode)
      throw new ConflictException(
        'GHN service has already been registered for this delivery!',
      );

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
    if (delivery.order) {
      if (!orderComicsList)
        throw new BadRequestException('Ordered comics list is required!');
      comicsList = orderComicsList;
    } else if (delivery.exchange)
      comicsList =
        await this.exchangeComicsService.getComicsListByUserAndExchange(
          delivery.from.user.id,
          delivery.exchange.id,
        );

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

    const registerGHNPayload = {
      payment_type_id:
        delivery.order && delivery.order.paymentMethod === 'COD' ? 2 : 1,
      required_note: 'CHOXEMHANGKHONGTHU',
      from_name: delivery.from.name,
      from_phone: delivery.from.phone,
      from_address: delivery.from.address,
      from_ward_name: from.ward.name,
      from_district_name: from.district.name,
      from_province_name: from.province.name,
      return_phone: delivery.from.phone,
      return_address: delivery.from.address,
      return_district_id: null,
      return_ward_code: '',
      client_order_code: '',
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
          price: item.price || 0,
          length: 30,
          width: 15,
          height: item.quantity * 4,
          weight: item.quantity * 500,
          category: {
            level1: 'Truyện tranh',
          },
        };
      }),
    };

    return await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
        registerGHNPayload,
        { headers },
      )
      .then(async (res) => {
        const data = res.data.data;
        return await this.deliveriesRepository
          .update(deliveryId, {
            deliveryTrackingCode: data.order_code,
            deliveryFee: data.total_fee,
            estimatedDeliveryTime: data.expected_delivery_time,
            status: OrderDeliveryStatusEnum.READY_TO_PICK,
          })
          .then(
            async () =>
              await this.deliveriesRepository.findOne({
                where: { id: deliveryId },
                relations: ['exchange'],
              }),
          );
      })
      .catch((err) => {
        console.log('Error creating GHN delivery: ', err.response.data);
        throw new BadRequestException(err.response.data);
      });
  }

  async autoUpdateGHNDeliveryStatus(deliveryId: string) {
    const delivery = await this.getOne(deliveryId);

    if (!delivery || !delivery.deliveryTrackingCode) return;
    if (
      delivery.overallStatus === DeliveryOverallStatusEnum.DELIVERED ||
      delivery.overallStatus === DeliveryOverallStatusEnum.RETURN
    )
      return;

    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };
    return await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail',
        {
          order_code: delivery.deliveryTrackingCode,
        },
        { headers },
      )
      .then(async (res) => {
        const deliveryStatus: OrderDeliveryStatusEnum = res.data.data.status;
        await this.deliveriesRepository.update(deliveryId, {
          status: deliveryStatus,
        });
        await this.updateDeliveryOverallStatus(deliveryId, deliveryStatus);
        return deliveryStatus;
      })
      .catch((err) => console.log('Error getting GHN delivery info: ', err));
  }

  async getDeliveryDetails(getDeliveryFeeDto: GetDeliveryFeeDTO) {
    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };
    const availableServices: any[] = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
        {
          shop_id: parseInt(process.env.GHN_SHOPID),
          from_district: getDeliveryFeeDto.fromDistrict,
          to_district: getDeliveryFeeDto.toDistrict,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data;
      })
      .catch((err) => {
        console.log('Error getting available services: ', err.response.data);
        throw new BadRequestException(err.response.data);
      });
    const deliveryFee = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          from_district_id: getDeliveryFeeDto.fromDistrict,
          from_ward_code: getDeliveryFeeDto.fromWard,
          to_district_id: getDeliveryFeeDto.toDistrict,
          to_ward_code: getDeliveryFeeDto.toWard,
          weight: 500 * getDeliveryFeeDto.comicsQuantity,
          service_id: availableServices[0].service_id,
          service_type_id: availableServices[0].service_type_id,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data.total;
      })
      .catch((err) => {
        throw new BadRequestException(
          'Error getting delivery fee: ',
          err.response.data,
        );
      });
    const estDeliveryTime = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime',
        {
          from_district_id: getDeliveryFeeDto.fromDistrict,
          from_ward_code: getDeliveryFeeDto.fromWard,
          to_district_id: getDeliveryFeeDto.toDistrict,
          to_ward_code: getDeliveryFeeDto.toWard,
          service_id: availableServices[0].service_id,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data.leadtime;
      })
      .catch((err) => {
        throw new BadRequestException(
          'Error getting estimated delivery time: ' + err.response.data,
        );
      });
    return {
      deliveryFee,
      estDeliveryTime: new Date(estDeliveryTime * 1000),
    };
  }

  async sendDeliveryAnnouncement(
    deliveryId: string,
    type: AnnouncementType,
    recipientId: string,
    recipientType: RecipientType,
  ) {
    const delivery = await this.deliveriesRepository.findOne({
      where: {
        id: deliveryId,
      },
      relations: ['exchange'],
    });

    const order = await this.ordersRepository.findOneBy({
      delivery: { id: delivery.id },
    });

    if (order) {
      const checkOrderAnnouncement = await this.announcementsRepository.findOne(
        {
          where: {
            user: { id: recipientId },
            order: { id: order.id },
            type,
          },
        },
      );

      if (checkOrderAnnouncement) {
        return;
      }
    } else if (delivery.exchange) {
      const checkExchangeAnnouncement =
        await this.announcementsRepository.findOne({
          where: {
            user: { id: recipientId },
            exchange: { id: delivery.exchange.id },
            type,
          },
        });

      if (checkExchangeAnnouncement) return;
    }

    console.log('ANNOUNCE: ', delivery.deliveryTrackingCode);

    const getAnnouncementData = () => {
      switch (type) {
        case AnnouncementType.DELIVERY_PICKING:
          return {
            title: 'Đơn hàng đang được lấy để giao',
            message:
              'Chúng tôi đang trên đường lấy đơn hàng của bạn để giao. Hãy đảm bảo bạn đã hoàn tất đóng gói trước khi nhân viên giao hàng của chúng tôi đến!',
          };
        case AnnouncementType.DELIVERY_ONGOING:
          return {
            title: 'Đơn hàng đang được giao đến bạn',
            message: 'Bạn có một đơn hàng đang trên đường giao đến bạn.',
          };
        case AnnouncementType.DELIVERY_FINISHED_RECEIVE:
          return {
            title: 'Đơn hàng đã nhận thành công',
            message:
              'Bạn có một đơn hàng đã được hoàn tất nhận hàng. Hãy đảm bảo bạn đã nhận được truyện nguyên vẹn từ nhân viên giao hàng của chúng tôi trước khi xác nhận giao hàng thành công!',
          };
        case AnnouncementType.DELIVERY_FINISHED_SEND:
          return {
            title: 'Đơn hàng đã giao thành công',
            message:
              'Một đơn hàng của bạn đã được giao thành công. Hệ thống sẽ cập nhật trạng thái đơn hàng sau khi người nhận xác nhận giao hàng thành công!',
          };
        case AnnouncementType.DELIVERY_FAILED_RECEIVE:
          return {
            title: 'Đơn hàng đã giao thất bại',
            message:
              'Giao hàng thất bại. Nhân viên giao hàng của chúng tôi đã không liên lạc được với bạn và đơn hàng sẽ được hoàn trả!',
          };
        case AnnouncementType.DELIVERY_FAILED_SEND:
          return {
            title: 'Đơn hàng đã giao thất bại',
            message:
              'Bạn có một đơn hàng được ghi nhận đã giao thất bại. Nhân viên giao hàng của chúng tôi đã không liên lạc được với người nhận. Hệ thống sẽ gửi thông báo cho bạn khi đơn hàng được hoàn trả!',
          };
        case AnnouncementType.DELIVERY_RETURN:
          return {
            title: 'Đơn hàng được hoàn trả',
            message:
              'Bạn có một đơn hàng được được hoàn trả do không giao thành công đến người nhận!',
          };
      }
    };

    await this.eventsGateway.notifyUser(
      recipientId,
      getAnnouncementData().message,
      {
        exchangeId: delivery.exchange ? delivery.exchange.id : null,
        orderId: order ? order.id : null,
      },
      getAnnouncementData().title,
      type,
      recipientType,
    );
  }

  async updateDeliveryOverallStatus(
    deliveryId: string,
    checkStatus: OrderDeliveryStatusEnum,
  ) {
    const delivery = await this.deliveriesRepository.findOne({
      where: { id: deliveryId },
      relations: ['exchange'],
    });

    if (!delivery) throw new NotFoundException('Delivery cannot be found!');

    if (!delivery.deliveryTrackingCode) return;

    if (
      [DeliveryOverallStatusEnum.DELIVERED].some(
        (status) => status === delivery.overallStatus,
      )
    )
      return;

    const pickingGroup = [
      OrderDeliveryStatusEnum.READY_TO_PICK,
      OrderDeliveryStatusEnum.PICKING,
      OrderDeliveryStatusEnum.MONEY_COLLECT_PICKING,
      OrderDeliveryStatusEnum.PICKED,
    ];

    const deliveringGroup = [
      OrderDeliveryStatusEnum.STORING,
      OrderDeliveryStatusEnum.TRANSPORTING,
      OrderDeliveryStatusEnum.SORTING,
      OrderDeliveryStatusEnum.DELIVERING,
      OrderDeliveryStatusEnum.MONEY_COLLECT_DELIVERING,
    ];

    const deliveredGroup = [OrderDeliveryStatusEnum.DELIVERED];

    const failedGroup = [
      OrderDeliveryStatusEnum.DELIVERY_FAIL,
      OrderDeliveryStatusEnum.EXCEPTION,
      OrderDeliveryStatusEnum.DAMAGE,
      OrderDeliveryStatusEnum.LOST,
    ];

    const returnGroup = [
      OrderDeliveryStatusEnum.WAITING_TO_RETURN,
      OrderDeliveryStatusEnum.RETURN,
      OrderDeliveryStatusEnum.RETURN_SORTING,
      OrderDeliveryStatusEnum.RETURN_TRANSPORTING,
      OrderDeliveryStatusEnum.RETURNING,
      OrderDeliveryStatusEnum.RETURN_FAIL,
      OrderDeliveryStatusEnum.RETURNED,
    ];

    if (pickingGroup.some((status) => status === checkStatus)) {
      await this.deliveriesRepository.update(delivery.id, {
        overallStatus: DeliveryOverallStatusEnum.PICKING,
      });

      if (checkStatus === OrderDeliveryStatusEnum.PICKING) {
        await this.sendDeliveryAnnouncement(
          delivery.id,
          AnnouncementType.DELIVERY_PICKING,
          delivery.from.user.id,
          delivery.exchange ? RecipientType.USER : RecipientType.SELLER,
        );
      }
    } else if (deliveringGroup.some((status) => status === checkStatus)) {
      await this.deliveriesRepository.update(delivery.id, {
        overallStatus: DeliveryOverallStatusEnum.DELIVERING,
      });

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_ONGOING,
        delivery.to.user.id,
        RecipientType.USER,
      );
    } else if (deliveredGroup.some((status) => status === checkStatus)) {
      await this.deliveriesRepository.update(delivery.id, {
        overallStatus: DeliveryOverallStatusEnum.DELIVERED,
      });

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_FINISHED_RECEIVE,
        delivery.to.user.id,
        RecipientType.USER,
      );

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_FINISHED_SEND,
        delivery.from.user.id,
        delivery.exchange ? RecipientType.USER : RecipientType.SELLER,
      );
    } else if (failedGroup.some((status) => status === checkStatus)) {
      await this.deliveriesRepository.update(delivery.id, {
        overallStatus: DeliveryOverallStatusEnum.FAILED,
      });

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_FAILED_RECEIVE,
        delivery.to.user.id,
        RecipientType.USER,
      );

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_FAILED_SEND,
        delivery.from.user.id,
        delivery.exchange ? RecipientType.USER : RecipientType.SELLER,
      );
    } else if (returnGroup.some((status) => status === checkStatus)) {
      await this.deliveriesRepository.update(delivery.id, {
        overallStatus: DeliveryOverallStatusEnum.RETURN,
      });

      await this.sendDeliveryAnnouncement(
        delivery.id,
        AnnouncementType.DELIVERY_RETURN,
        delivery.from.user.id,
        delivery.exchange ? RecipientType.USER : RecipientType.SELLER,
      );
    }
  }

  async getDeliveryDetailsByDeliveryId(deliveryId: string) {
    const delivery = await this.deliveriesRepository.findOne({
      where: { id: deliveryId },
    });
    if (!delivery) throw new NotFoundException('Delivery cannot be found!');

    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };
    const availableServices: any[] = await axios
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
        console.log('Error getting available services: ', err.response.data);
        throw new BadRequestException(err.response.data);
      });
    const deliveryFee = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
        {
          from_district_id: delivery.from.districtId,
          from_ward_code: delivery.from.wardId,
          to_district_id: delivery.to.districtId,
          to_ward_code: delivery.to.wardId,
          weight: 1000,
          service_id: availableServices[0].service_id,
          service_type_id: availableServices[0].service_type_id,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data.total;
      })
      .catch((err) => {
        throw new BadRequestException(
          'Error getting delivery fee: ',
          err.response.data,
        );
      });
    const estDeliveryTime = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime',
        {
          from_district_id: delivery.from.districtId,
          from_ward_code: delivery.from.wardId,
          to_district_id: delivery.to.districtId,
          to_ward_code: delivery.to.wardId,
          service_id: availableServices[0].service_id,
        },
        { headers },
      )
      .then((res) => {
        return res.data.data.leadtime;
      })
      .catch((err) => {
        throw new BadRequestException(
          'Error getting estimated delivery time: ' + err.response.data,
        );
      });

    if (!delivery.deliveryFee) {
      await this.deliveriesRepository.update(deliveryId, {
        deliveryFee,
      });
    }

    return {
      deliveryFee,
      estDeliveryTime: new Date(estDeliveryTime * 1000),
    };
  }

  async getFullAddressString(info: DeliveryInformation) {
    if (info)
      return (
        info.address +
        ', ' +
        (await this.vnAddressService.getWardById(info.districtId, info.wardId))
          .name +
        ', ' +
        (
          await this.vnAddressService.getDistrictById(
            info.provinceId,
            info.districtId,
          )
        ).name +
        ', ' +
        (await this.vnAddressService.getProvinceById(info.provinceId)).name
      );
  }

  async getByOrder(orderId: string) {
    const deliveries = await this.deliveriesRepository.find({
      where: { order: { id: orderId } },
      relations: ['order'],
    });

    if (deliveries.length > 0)
      await Promise.all(
        deliveries.map((d) => this.autoUpdateGHNDeliveryStatus(d.id)),
      );

    const newList = await this.deliveriesRepository.find({
      where: { order: { id: orderId } },
      relations: ['order'],
    });

    return await Promise.all(
      newList.map(async (delivery) => {
        return {
          ...delivery,
          from: delivery.from
            ? {
                ...delivery.from,
                fullAddress: await this.getFullAddressString(delivery.from),
              }
            : null,
          to: delivery.to
            ? {
                ...delivery.to,
                fullAddress: await this.getFullAddressString(delivery.to),
              }
            : null,
        };
      }),
    );
  }

  async getByExchange(exchangeId: string) {
    const deliveries = await this.deliveriesRepository.find({
      where: { exchange: { id: exchangeId } },
      relations: ['exchange'],
    });

    if (deliveries.length > 0)
      await Promise.all(
        deliveries.map((d) => this.autoUpdateGHNDeliveryStatus(d.id)),
      );

    const newList = await this.deliveriesRepository.find({
      where: { exchange: { id: exchangeId } },
      relations: ['exchange'],
    });

    return await Promise.all(
      newList.map(async (delivery) => {
        return {
          ...delivery,
          from: delivery.from
            ? {
                ...delivery.from,
                fullAddress: await this.getFullAddressString(delivery.from),
              }
            : null,
          to: delivery.to
            ? {
                ...delivery.to,
                fullAddress: await this.getFullAddressString(delivery.to),
              }
            : null,
        };
      }),
    );
  }

  async getByExchangeAndFromUser(userId: string, exchangeId: string) {
    const delivery = await this.deliveriesRepository.findOne({
      where: {
        exchange: { id: exchangeId },
        from: { user: { id: userId } },
      },
      relations: ['exchange'],
    });

    if (!delivery) return;

    await this.autoUpdateGHNDeliveryStatus(delivery.id);

    const updated = await this.getOne(delivery.id);

    return {
      ...updated,
      from: delivery.from
        ? {
            ...delivery.from,
            fullAddress: await this.getFullAddressString(delivery.from),
          }
        : null,
      to: delivery.to
        ? {
            ...delivery.to,
            fullAddress: await this.getFullAddressString(delivery.to),
          }
        : null,
    };
  }

  async getByExchangeAndToUser(userId: string, exchangeId: string) {
    const delivery = await this.deliveriesRepository.findOne({
      where: {
        exchange: { id: exchangeId },
        to: { user: { id: userId } },
      },
      relations: ['exchange'],
    });

    if (!delivery) return;

    await this.autoUpdateGHNDeliveryStatus(delivery.id);

    const updated = await this.getOne(delivery.id);

    return {
      ...updated,
      from: delivery.from
        ? {
            ...delivery.from,
            fullAddress: await this.getFullAddressString(delivery.from),
          }
        : null,
      to: delivery.to
        ? {
            ...delivery.to,
            fullAddress: await this.getFullAddressString(delivery.to),
          }
        : null,
    };
  }
}
