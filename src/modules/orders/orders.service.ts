import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
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
import * as dotenv from 'dotenv';
import axios from 'axios';
import { CancelOrderDTO } from './dto/cancel-order.dto';
import { OrderDeliveryStatusEnum } from './dto/order-delivery-status.enum';
import { UserAddressesService } from '../user-addresses/user-addresses.service';
import {
  CompleteOrderFailedDTO,
  CompleteOrderSuccessfulDTO,
} from './dto/complete-order.dto';
import { DeliveriesService } from '../deliveries/deliveries.service';
import { TransactionsService } from '../transactions/transactions.service';
import { EventsGateway } from '../socket/event.gateway';
import { RecipientType } from 'src/entities/announcement.entity';
dotenv.config();

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,

    private readonly usersService: UsersService,
    private readonly deliveriesService: DeliveriesService,
    private readonly comicsService: ComicService,
    private readonly addressesService: UserAddressesService,
    private readonly transactionsService: TransactionsService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
  ) {
    super(ordersRepository);
  }

  async getAll(): Promise<Order[]> {
    const orderList = await this.ordersRepository.find();
    await Promise.all(
      orderList.map(async (order) => {
        await this.autoUpdateOrderStatus(order.id);
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

    const delivery = await this.deliveriesService.getOne(
      createOrderDto.deliveryId,
    );
    if (!delivery) throw new NotFoundException('Delivery cannot be found!');

    const checkDuplicatedDelivery = await this.ordersRepository.findOne({
      where: { delivery: { id: createOrderDto.deliveryId } },
    });

    if (checkDuplicatedDelivery)
      throw new ConflictException('Duplicated delivery!');

    const newOrder = this.ordersRepository.create({
      user,
      delivery,
      totalPrice: createOrderDto.totalPrice,
      paymentMethod: createOrderDto.paymentMethod,
      note: createOrderDto.note,
      type: createOrderDto.type,
    });

    if (createOrderDto.paymentMethod === 'WALLET') {
      if (user.balance < createOrderDto.totalPrice)
        throw new ForbiddenException('Insufficient balance!');

      await this.usersService.updateBalance(userId, -createOrderDto.totalPrice);

      await this.usersService.updateBalanceWithNonWithdrawableAmount(
        createOrderDto.sellerId,
        createOrderDto.totalPrice,
      );
    }

    await this.addressesService.incrementAddressUsedTime(
      createOrderDto.addressId,
    );

    await this.ordersRepository.save(newOrder);

    await this.transactionsService.createOrderTransaction(
      userId,
      newOrder.id,
      'SUBTRACT',
    );

    await this.transactionsService.createOrderTransaction(
      createOrderDto.sellerId,
      newOrder.id,
      'ADD',
    );
    this.eventsGateway.notifyUser(
      createOrderDto.sellerId,
      `Bạn có một đơn hàng từ tài khoản ${user.name} trị giá ${newOrder.totalPrice.toLocaleString('vi-VN')}đ`,
      { orderId: newOrder.id },
      'Đơn hàng mới',
      'ORDER',
      RecipientType.SELLER,
      'SUCCESSFUL',
    );
    return await this.getOne(newOrder.id);
  }

  async autoUpdateOrderStatus(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['delivery', 'delivery.from', 'delivery.to'],
    });

    if (!order) throw new NotFoundException('Order cannot be found!');

    if (!order.delivery.deliveryTrackingCode) return;

    if (
      [
        OrderStatusEnum.SUCCESSFUL,
        OrderStatusEnum.FAILED,
        OrderStatusEnum.CANCELED,
      ].find((status) => status === order.status)
    )
      return;

    const newDeliveryStatus =
      await this.deliveriesService.autoUpdateGHNDeliveryStatus(
        order.delivery.id,
      );

    if (!newDeliveryStatus) return;

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

    if (packagingGroup.some((status) => status === newDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.PACKAGING);
    } else if (deliveringGroup.some((status) => status === newDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.DELIVERING);
    } else if (deliveredGroup.some((status) => status === newDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.DELIVERED);
    } else if (failedGroup.some((status) => status === newDeliveryStatus)) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.FAILED);
    } else if (newDeliveryStatus === OrderDeliveryStatusEnum.CANCEL) {
      await this.updateOrderStatus(orderId, OrderStatusEnum.CANCELED);
    }
  }

  async getSellerIdOfAnOrder(orderId: string): Promise<User> {
    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
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
      order: {
        updatedAt: 'DESC',
        createdAt: 'DESC',
      },
    });

    await Promise.all(
      orderList.map(async (order) => {
        await this.autoUpdateOrderStatus(order.id);
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
        await this.autoUpdateOrderStatus(id);
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
      .leftJoinAndSelect('order.delivery', 'delivery')
      .leftJoinAndSelect('delivery.from', 'from')
      .leftJoinAndSelect('delivery.to', 'to')
      .where('seller.id = :sellerId', { sellerId })
      .select('order.id')
      .distinct(true)
      .execute();

    const orderList = items.map((item) => {
      return item.order_id;
    });

    return await Promise.all(
      orderList.map(async (id) => {
        await this.autoUpdateOrderStatus(id);
        return await this.getOne(id);
      }),
    );
  }

  async getOrderByDeliveryTrackingCode(code: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { delivery: { deliveryTrackingCode: code } },
    });

    await this.autoUpdateOrderStatus(order.id);
    return await this.getOne(order.id);
  }

  async cancelDeliveryOrder(cancelOrderDto: CancelOrderDTO) {
    const order = await this.getOne(cancelOrderDto.orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');

    let deliveryCancel: any;
    if (order.delivery.deliveryTrackingCode) {
      const headers = {
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOPID,
      };

      deliveryCancel = await axios
        .post(
          'https://dev-online-gateway.ghn.vn/shiip/public-api/v2/switch-status/cancel',
          {
            order_codes: [order.delivery.deliveryTrackingCode],
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
      delivery: {
        status: order.delivery.status ? OrderDeliveryStatusEnum.CANCEL : null,
      },
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

    const comicsList = orderItemList.map((item) => {
      return item.comics;
    });

    await this.deliveriesService.registerNewGHNDelivery(
      order.delivery.id,
      comicsList,
    );

    return await this.getOne(orderId);
  }

  async updateOrderIsPaid(orderId: string, status: boolean) {
    return await this.ordersRepository
      .update(orderId, {
        isPaid: status,
      })
      .then(() => this.getOne(orderId));
  }

  async updateComicsStatusOfAnOrder(orderId: string) {
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
    const order = await this.getOne(cancelOrderDto.orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');

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
    if (order.paymentMethod === 'WALLET') {
      const seller = await this.getSellerIdOfAnOrder(order.id);
      await this.usersService.updateBalance(order.user.id, order.totalPrice);
      await this.usersService.updateBalanceWithNonWithdrawableAmount(
        seller.id,
        -order.totalPrice,
      );
    }

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
