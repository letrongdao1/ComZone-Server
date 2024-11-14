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
import { Order } from 'src/entities/orders.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateOrderDTO } from './dto/createOrderDTO';
import { OrderStatusEnum } from './dto/order-status.enum';
import { OrderItem } from 'src/entities/order-item.entity';
import { User } from 'src/entities/users.entity';
import { ComicService } from '../comics/comics.service';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { GetDeliveryFeeDTO } from './dto/get-delivery-fee.dto';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { CancelOrderDTO } from './dto/cancel-order.dto';
import { OrderDeliveryStatusEnum } from './dto/order-delivery-status.enum';
import { UserAddressesService } from '../user-addresses/user-addresses.service';
import {
  CompleteOrderFailedDTO,
  CompleteOrderSuccessfulDTO,
} from './dto/complete-order.dto';

dotenv.config();

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,

    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
    @Inject(UserAddressesService)
    private readonly addressesService: UserAddressesService,
  ) {
    super(ordersRepository);
  }

  async getAll(): Promise<Order[]> {
    const orderList = await this.ordersRepository.find();
    await Promise.all(
      orderList.map(async (order) => {
        await this.autoUpdateOrderDeliveryStatus(order.id);
      }),
    );
    return await this.ordersRepository.find({
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async createNewOrder(userId: string, createOrderDto: CreateOrderDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newOrder = this.ordersRepository.create({
      ...createOrderDto,
      user,
    });

    await this.addressesService.incrementAddressUsedTime(
      createOrderDto.addressId,
    );

    return await this.ordersRepository
      .save(newOrder)
      .then(() => this.getOne(newOrder.id));
  }

  async autoUpdateOrderDeliveryStatus(orderId: string) {
    const order = await this.getOne(orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');

    if (!order.deliveryTrackingCode) return;

    if (
      [
        OrderStatusEnum.SUCCESSFUL,
        OrderStatusEnum.FAILED,
        OrderStatusEnum.CANCELED,
      ].find((status) => status === order.status)
    )
      return;

    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };

    const fetchedDeliveryStatus = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail',
        {
          order_code: order.deliveryTrackingCode,
        },
        { headers },
      )
      .then(async (res) => {
        const deliveryStatus = res.data.data.status;
        await this.ordersRepository.update(orderId, {
          deliveryStatus: deliveryStatus,
        });
        return deliveryStatus;
      })
      .catch((err) => console.log('Error getting order delivery info: ', err));

    const packagingGroup = [
      OrderDeliveryStatusEnum.READY_TO_PICK,
      OrderDeliveryStatusEnum.PICKING,
      OrderDeliveryStatusEnum.PICKED,
      OrderDeliveryStatusEnum.MONEY_COLLECT_PICKING,
    ];
    const deliveringGroup = [
      OrderDeliveryStatusEnum.STORING,
      OrderDeliveryStatusEnum.TRANSPORTING,
      OrderDeliveryStatusEnum.SORTING,
      OrderDeliveryStatusEnum.DELIVERING,
      OrderDeliveryStatusEnum.MONEY_COLLECT_DELIVERING,
    ];
    const deliveredGroup = [
      OrderDeliveryStatusEnum.DELIVERY_FAIL,
      OrderDeliveryStatusEnum.DELIVERED,
    ];
    const failedGroup = [
      OrderDeliveryStatusEnum.WAITING_TO_RETURN,
      OrderDeliveryStatusEnum.RETURN,
      OrderDeliveryStatusEnum.RETURN_SORTING,
      OrderDeliveryStatusEnum.RETURN_TRANSPORTING,
      OrderDeliveryStatusEnum.RETURNING,
      OrderDeliveryStatusEnum.RETURN_FAIL,
      OrderDeliveryStatusEnum.RETURNED,
      OrderDeliveryStatusEnum.EXCEPTION,
      OrderDeliveryStatusEnum.DAMAGE,
      OrderDeliveryStatusEnum.LOST,
    ];

    if (packagingGroup.some((status) => status === fetchedDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.PACKAGING);
    } else if (
      deliveringGroup.some((status) => status === fetchedDeliveryStatus)
    ) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.DELIVERING);
    } else if (
      deliveredGroup.some((status) => status === fetchedDeliveryStatus)
    ) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.DELIVERED);
    } else if (failedGroup.some((status) => status === fetchedDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.FAILED);
    } else if (fetchedDeliveryStatus === OrderDeliveryStatusEnum.CANCEL) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.CANCELED);
    }
  }

  async getSellerIdOfAnOrder(orderId: string): Promise<User> {
    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
    });

    if (!orderItemList || orderItemList.length === 0)
      throw new NotFoundException('Cannot find any order item!');

    return orderItemList[0].comics.sellerId;
  }

  async getAllOrdersOfUser(userId: string): Promise<Order[]> {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const orderList = await this.ordersRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });

    await Promise.all(
      orderList.map(async (order) => {
        await this.autoUpdateOrderDeliveryStatus(order.id);
      }),
    );

    return await this.ordersRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAllOrdersByListOfIDs(orderIds: string[]) {
    return await Promise.all(
      orderIds.map(async (id) => {
        await this.autoUpdateOrderDeliveryStatus(id);
        return await this.getOne(id);
      }),
    );
  }

  async getAllOrdersOfSeller(sellerId: string): Promise<any[]> {
    const seller = await this.usersService.getOne(sellerId);
    if (!seller) throw new NotFoundException('Seller cannot be found!');

    const items: { order_id: string }[] = await this.orderItemsRepository
      .createQueryBuilder('order_item')
      .leftJoinAndSelect('order_item.comics', 'comics')
      .leftJoinAndSelect('order_item.order', 'order')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .where('seller.id = :sellerId', { sellerId })
      .select('order.id')
      .distinct(true)
      .execute();

    const orderList = items.map((item) => {
      return item.order_id;
    });

    return await Promise.all(
      orderList.map(async (id) => {
        await this.autoUpdateOrderDeliveryStatus(id);
        return await this.getOne(id);
      }),
    );
  }

  async getOrderByDeliveryTrackingCode(code: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { deliveryTrackingCode: code },
    });

    await this.autoUpdateOrderDeliveryStatus(order.id);
    return await this.getOne(order.id);
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
          weight: 100 * getDeliveryFeeDto.comicsQuantity,
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

  async cancelDeliveryOrder(cancelOrderDto: CancelOrderDTO) {
    const order = await this.getOne(cancelOrderDto.orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');

    let deliveryCancel: any;
    if (order.deliveryTrackingCode) {
      const headers = {
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOPID,
      };

      deliveryCancel = await axios
        .post(
          'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
          {
            order_codes: [order.deliveryTrackingCode],
          },
          { headers },
        )
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          console.log('Error canceling order delivery: ', err);
          throw new BadRequestException(err.response.data);
        });
    }

    await this.ordersRepository.update(cancelOrderDto.orderId, {
      status: OrderStatusEnum.CANCELED,
      deliveryStatus: order.deliveryStatus
        ? OrderDeliveryStatusEnum.CANCEL
        : null,
      cancelReason: cancelOrderDto.cancelReason,
    });

    return {
      order: await this.getOne(cancelOrderDto.orderId),
      deliveryCancel: deliveryCancel || 'No delivery initiated yet!',
    };
  }

  async updateOrderStatus(orderId: string, status: OrderStatusEnum) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order cannot be found!');

    return await this.ordersRepository
      .update(orderId, { status })
      .then(async () => {
        return this.getOne(orderId);
      });
  }

  async sellerStartsPackaging(orderId: string) {
    const order = await this.getOne(orderId);
    if (order.status !== OrderStatusEnum.PENDING)
      throw new ForbiddenException('Only pending orders are accepted!');

    return await this.updateOrderStatus(
      orderId,
      OrderStatusEnum.PACKAGING,
    ).then(() => this.getOne(orderId));
  }

  async sellerFinishesPackaging(orderId: string) {
    const order = await this.getOne(orderId);
    if (order.status !== OrderStatusEnum.PACKAGING)
      throw new ForbiddenException('Only packaging orders are accepted!');

    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
    });

    if (orderItemList.length === 0)
      throw new NotFoundException('No order item of the order can be found!');

    const headers = {
      Token: process.env.GHN_TOKEN,
      ShopId: process.env.GHN_SHOPID,
    };

    const services = await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
        {
          shop_id: parseInt(process.env.GHN_SHOPID),
          from_district: order.fromDistrictId,
          to_district: order.toDistrictId,
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

    await axios
      .post(
        'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create',
        {
          payment_type_id: order.paymentMethod === 'WALLET' ? 1 : 2,
          required_note: 'CHOXEMHANGKHONGTHU',
          from_name: order.fromName,
          from_phone: order.fromPhone,
          from_address: order.fromAddress,
          from_ward_name: order.fromWardName,
          from_district_name: order.fromDistrictName,
          from_province_name: order.fromProvinceName,
          return_phone: order.fromPhone,
          return_address: order.fromAddress,
          return_district_id: order.fromDistrictId,
          return_ward_code: order.fromWardId,
          to_name: order.toName,
          to_phone: order.toPhone,
          to_address: order.toAddress,
          to_ward_code: order.toWardId,
          to_district_id: order.toDistrictId,
          cod_amount: order.paymentMethod === 'WALLET' ? 0 : order.totalPrice,
          content: 'Truyện tranh',
          weight: orderItemList.length * 200,
          length: 30,
          width: 15,
          height: orderItemList.length * 2,
          quantity: orderItemList.length,
          pick_station_id: null,
          deliver_station_id: null,
          insurance_value: 0,
          service_id: services[0].service_id,
          service_type_id: services[0].service_type_id,
          coupon: null,
          // pick_shift: [2],
          items: orderItemList.map((item) => {
            return {
              code: item.order.id + '-' + item.comics.id,
              name: item.comics.title,
              quantity: item.comics.quantity,
              price: item.price,
              length: 30,
              width: 15,
              height: item.comics.quantity * 2,
              weight: item.comics.quantity * 100,
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
        await this.ordersRepository.update(orderId, {
          deliveryTrackingCode: data.order_code,
          deliveryStatus: OrderDeliveryStatusEnum.READY_TO_PICK,
        });
      })
      .catch((err) => {
        console.log('Error creating order delivery: ', err.response.data);
        throw new BadRequestException(err.response.data);
      });

    return await this.getOne(orderId);
  }

  async updateOrderIsPaid(orderId: string, status: boolean) {
    return await this.ordersRepository
      .update(orderId, {
        isPaid: status,
      })
      .then(() => this.getOne(orderId));
  }

  async updateComicsStatusOfAnOrder(orderId: string, status: string) {
    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
    });

    if (!orderItemList || orderItemList.length === 0)
      throw new NotFoundException('Cannot find any order item!');

    await Promise.all(
      orderItemList.map(async (item) => {
        await this.comicsService.updateStatus(
          item.comics.id,
          ComicsStatusEnum.SOLD,
        );
      }),
    );

    return {
      message: 'Comics are all successfully updated to SOLD!',
    };
  }

  async cancelOrder(cancelOrderDto: CancelOrderDTO) {
    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: cancelOrderDto.orderId } },
    });

    await Promise.all(
      orderItemList.map(async (item) => {
        await this.comicsService.updateStatus(
          item.comics.id,
          ComicsStatusEnum.UNAVAILABLE,
        );
      }),
    );

    //Hoàn tiền cho người mua nếu đã thanh toán, thông báo đơn bị hủy

    return await this.ordersRepository
      .update(cancelOrderDto.orderId, {
        status: OrderStatusEnum.CANCELED,
        cancelReason: cancelOrderDto.cancelReason || 'Không có lí do',
      })
      .then(() => this.getOne(cancelOrderDto.orderId));
  }

  async completeOrderToBeSuccessful(
    userId: string,
    dto: CompleteOrderSuccessfulDTO,
  ) {
    const order = await this.getOne(dto.order);
    if (!order) throw new NotFoundException('Order cannot be found!');

    if (order.user.id !== userId)
      throw new ForbiddenException('Order does not belong to this user!');

    return await this.ordersRepository
      .update(order.id, {
        status: OrderStatusEnum.SUCCESSFUL,
        isFeedback: dto.isFeedback,
      })
      .then(() => this.getOne(order.id));
  }

  async completeOrderToBeFailed(userId: string, dto: CompleteOrderFailedDTO) {
    const order = await this.getOne(dto.order);
    if (!order) throw new NotFoundException('Order cannot be found!');

    if (order.user.id !== userId)
      throw new ForbiddenException('Order does not belong to this user!');

    return await this.ordersRepository
      .update(order.id, {
        status: OrderStatusEnum.FAILED,
        note: dto.note || '',
      })
      .then(() => this.getOne(order.id));
  }
}
