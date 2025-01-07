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
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import { generateNumericAndUppercaseCode } from 'src/utils/generator/generators';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { VietNamAddressService } from '../viet-nam-address/viet-nam-address.service';
import { DeliveryInformation } from 'src/entities/delivery-information.entity';
dotenv.config();

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(RefundRequest)
    private readonly refundRequestsRepository: Repository<RefundRequest>,

    @Inject(forwardRef(() => ComicService))
    private readonly comicsService: ComicService,

    private readonly usersService: UsersService,
    private readonly deliveriesService: DeliveriesService,
    private readonly addressesService: UserAddressesService,
    private readonly transactionsService: TransactionsService,
    private readonly vnAddressesService: VietNamAddressService,
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

    const newCode = generateNumericAndUppercaseCode(8, '');

    const newOrder = this.ordersRepository.create({
      user,
      delivery,
      code: newCode,
      totalPrice: createOrderDto.totalPrice,
      paymentMethod: createOrderDto.paymentMethod,
      note: createOrderDto.note,
      type: createOrderDto.type,
    });

    await this.addressesService.incrementAddressUsedTime(
      createOrderDto.addressId,
    );

    await this.ordersRepository.save(newOrder);

    const depositAmount = createOrderDto.depositAmount || 0;
    const remainingAmount =
      createOrderDto.totalPrice + delivery.deliveryFee - depositAmount;

    // Create transaction if paid via WALLET
    if (createOrderDto.paymentMethod === 'WALLET') {
      if (remainingAmount > 0) {
        if (user.balance < remainingAmount) {
          throw new ForbiddenException('Insufficient balance!');
        }

        await this.usersService.updateBalance(userId, -remainingAmount);

        await this.usersService.updateNonWithdrawableAmount(
          createOrderDto.sellerId,
          createOrderDto.totalPrice,
        );

        const userTransaction =
          await this.transactionsService.createOrderTransactionAuctionComic(
            userId,
            newOrder.id,
            'SUBTRACT',
            remainingAmount,
          );

        const sellerTransaction =
          await this.transactionsService.createOrderTransaction(
            createOrderDto.sellerId,
            newOrder.id,
            'ADD',
          );

        await this.eventsGateway.notifyUser(
          userId,
          `Thanh toán đơn hàng #${newCode} với số tiền ${(newOrder.totalPrice + newOrder.delivery.deliveryFee).toLocaleString('vi-VN')}đ thành công.`,
          { transactionId: userTransaction.id },
          'Thanh toán thành công',
          AnnouncementType.TRANSACTION_SUBTRACT,
          RecipientType.USER,
          'SUCCESSFUL',
        );

        await this.eventsGateway.notifyUser(
          createOrderDto.sellerId,
          `Nhận ${newOrder.totalPrice.toLocaleString('vi-VN')}đ vào ví ComZone tiền đơn hàng #${newCode}. Bạn chưa thể sử dụng hay rút số tiền này cho đến khi người đặt hàng nhận hàng thành công.`,
          { transactionId: sellerTransaction.id },
          'Nhận tiền đơn hàng',
          AnnouncementType.TRANSACTION_ADD,
          RecipientType.SELLER,
          'SUCCESSFUL',
        );
      } else {
        const refundAmount =
          depositAmount - (createOrderDto.totalPrice + delivery.deliveryFee);

        await this.usersService.updateBalance(userId, refundAmount);

        const refundTransaction =
          await this.transactionsService.createRefundTransactionOrder(
            userId,
            newOrder.id,
            refundAmount,
          );
        const userTransaction =
          await this.transactionsService.createOrderTransaction(
            userId,
            newOrder.id,
            'SUBTRACT',
          );

        await this.eventsGateway.notifyUser(
          userId,
          `Thanh toán đơn hàng #${newCode} với số tiền ${(newOrder.totalPrice + newOrder.delivery.deliveryFee).toLocaleString('vi-VN')}đ thành công.`,
          { transactionId: userTransaction.id },
          'Thanh toán thành công',
          AnnouncementType.TRANSACTION_SUBTRACT,
          RecipientType.USER,
          'SUCCESSFUL',
        );

        await this.eventsGateway.notifyUser(
          userId,
          `Hoàn lại ${refundAmount.toLocaleString('vi-VN')}đ tiền cọc cho đơn hàng #${newCode}.`,
          { transactionId: refundTransaction.id },
          'Hoàn tiền cọc',
          AnnouncementType.TRANSACTION_ADD,
          RecipientType.USER,
          'SUCCESSFUL',
        );
        const sellerTransaction =
          await this.transactionsService.createOrderTransaction(
            createOrderDto.sellerId,
            newOrder.id,
            'ADD',
          );
        await this.eventsGateway.notifyUser(
          createOrderDto.sellerId,
          `Nhận ${newOrder.totalPrice.toLocaleString('vi-VN')}đ vào ví ComZone tiền đơn hàng #${newCode}. Bạn chưa thể sử dụng hay rút số tiền này cho đến khi người đặt hàng nhận hàng thành công.`,
          { transactionId: sellerTransaction.id },
          'Nhận tiền đơn hàng',
          AnnouncementType.TRANSACTION_ADD,
          RecipientType.SELLER,
          'SUCCESSFUL',
        );
      }
    }
    // Notify the seller about the new order
    await this.eventsGateway.notifyUser(
      createOrderDto.sellerId,
      `Bạn nhận được đơn hàng #${newCode} từ tài khoản ${user.name} trị giá ${newOrder.totalPrice.toLocaleString('vi-VN')}đ`,
      { orderId: newOrder.id },
      'Đơn hàng mới',
      AnnouncementType.ORDER_NEW,
      RecipientType.SELLER,
      'SUCCESSFUL',
    );

    return await this.getOne(newOrder.id);
  }
  async getById(orderId: string) {
    await this.autoUpdateOrderStatus(orderId);
    return await this.getOrderFullAddress(orderId);
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
      ].some((status) => status === order.status)
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

    const deliveredGroup = [OrderDeliveryStatusEnum.DELIVERED];

    const failedGroup = [
      OrderDeliveryStatusEnum.DELIVERY_FAIL,
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

  async getOrderFullAddress(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['delivery', 'delivery.from', 'delivery.to'],
    });

    if (!order || !order.delivery)
      throw new NotFoundException('Order delivery cannot be found!');

    const getFullAddressString = async (info: DeliveryInformation) => {
      return (
        (
          await this.vnAddressesService.getWardById(
            info.districtId,
            info.wardId,
          )
        ).name +
        ', ' +
        (
          await this.vnAddressesService.getDistrictById(
            info.provinceId,
            info.districtId,
          )
        ).name +
        ', ' +
        (await this.vnAddressesService.getProvinceById(info.provinceId)).name
      );
    };

    return {
      ...order,
      delivery: {
        ...order.delivery,
        from: {
          ...order.delivery.from,
          fullAddress: await getFullAddressString(order.delivery.from),
        },
        to: {
          ...order.delivery.to,
          fullAddress: await getFullAddressString(order.delivery.to),
        },
      },
    };
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

  async getAllOrdersOfUser(userId: string) {
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

    const updatedOrders = await this.ordersRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        updatedAt: 'DESC',
      },
    });

    return await Promise.all(
      updatedOrders.map(
        async (order) => await this.getOrderFullAddress(order.id),
      ),
    );
  }

  async getAllOrdersByListOfIDs(orderIds: string[]) {
    return await Promise.all(
      orderIds.map(async (id) => {
        await this.autoUpdateOrderStatus(id);
        return await this.getOrderFullAddress(id);
      }),
    );
  }

  async getAllOrdersOfSeller(sellerId: string) {
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

    const orderIdList = items.map((item) => {
      return item.order_id;
    });

    const orderList = await Promise.all(
      orderIdList.map(async (id) => {
        await this.autoUpdateOrderStatus(id);
        return await this.getOrderFullAddress(id);
      }),
    );

    return orderList.sort((a, b) => {
      const statusOrder = [
        OrderStatusEnum.PENDING,
        OrderStatusEnum.PACKAGING,
        OrderStatusEnum.DELIVERING,
        OrderStatusEnum.DELIVERED,
        OrderStatusEnum.SUCCESSFUL,
        OrderStatusEnum.CANCELED,
        OrderStatusEnum.FAILED,
      ];
      if (a.status !== b.status) {
        return (
          statusOrder.findIndex((value) => value === a.status) -
          statusOrder.findIndex((value) => value === b.status)
        );
      } else {
        return new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1;
      }
    });
  }

  async userSearchByComicsSellerAndCode(userId: string, key: string) {
    if (key.length === 0) return;

    const orderIdList: { order_id: string }[] = await this.orderItemsRepository
      .createQueryBuilder('order_item')
      .leftJoinAndSelect('order_item.comics', 'comics')
      .leftJoinAndSelect('order_item.order', 'order')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .leftJoinAndSelect('order.delivery', 'delivery')
      .leftJoinAndSelect('delivery.from', 'from')
      .leftJoinAndSelect('delivery.to', 'to')
      .where(
        'LOWER(seller.name) LIKE :key OR LOWER(comics.title) LIKE :key OR LOWER(order.code) LIKE :key OR LOWER(delivery.deliveryTrackingCode) LIKE :key',
        {
          key: `%${key.toLowerCase()}%`,
        },
      )
      .andWhere('order.user.id = :userId', { userId })
      .select('order.id')
      .distinct(true)
      .execute();

    const orders = await Promise.all(
      orderIdList.map(async (item) => {
        return await this.getOrderFullAddress(item.order_id);
      }),
    );

    return await Promise.all(
      orders.map(async (order) => {
        const orderItems = await this.orderItemsRepository.find({
          where: {
            order: { id: order.id },
          },
          relations: ['comics', 'order'],
        });

        const refundRequest = await this.refundRequestsRepository.findOne({
          where: { order: { id: order.id } },
        });
        return {
          ...order,
          items: orderItems,
          refundRequest,
          rejectReason: refundRequest?.rejectedReason || null,
        };
      }),
    );
  }

  async sellerSearchByComicsSellerAndCode(sellerId: string, key: string) {
    const items: { order_id: string }[] = await this.orderItemsRepository
      .createQueryBuilder('order_item')
      .leftJoinAndSelect('order_item.comics', 'comics')
      .leftJoinAndSelect('order_item.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('comics.sellerId', 'seller')
      .leftJoinAndSelect('order.delivery', 'delivery')
      .leftJoinAndSelect('delivery.from', 'from')
      .leftJoinAndSelect('delivery.to', 'to')
      .where('seller.id = :sellerId', { sellerId })
      .andWhere(
        'LOWER(user.name) LIKE :key OR LOWER(comics.title) LIKE :key OR LOWER(order.code) LIKE :key OR LOWER(delivery.deliveryTrackingCode) LIKE :key',
        { key: `%${key.toLowerCase()}%` },
      )
      .select('order.id')
      .distinct(true)
      .execute();

    const orderList = await Promise.all(
      items.map(async (item) => {
        return await this.getOrderFullAddress(item.order_id);
      }),
    );

    return orderList.sort((a, b) => {
      const statusOrder = [
        OrderStatusEnum.PENDING,
        OrderStatusEnum.PACKAGING,
        OrderStatusEnum.DELIVERING,
        OrderStatusEnum.DELIVERED,
        OrderStatusEnum.SUCCESSFUL,
        OrderStatusEnum.CANCELED,
        OrderStatusEnum.FAILED,
      ];
      if (a.status !== b.status) {
        return (
          statusOrder.findIndex((value) => value === a.status) -
          statusOrder.findIndex((value) => value === b.status)
        );
      } else {
        return new Date(a.updatedAt) < new Date(b.updatedAt) ? 1 : -1;
      }
    });
  }

  async getRecentOrdersBySeller(sellerId: string) {
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
      .where('order.status = :status', { status: OrderStatusEnum.SUCCESSFUL })
      .select('order.id')
      .distinct(true)
      .take(10)
      .execute();

    return await Promise.all(
      items.map(async (item) => {
        return await this.orderItemsRepository.findOne({
          where: { order: { id: item.order_id } },
          relations: ['order', 'comics'],
        });
      }),
    );
  }

  async getSellerOrderData(sellerId: string) {
    const orders = await this.getAllOrdersOfSeller(sellerId);

    const ongoingGroup = [
      OrderStatusEnum.PENDING,
      OrderStatusEnum.PACKAGING,
      OrderStatusEnum.DELIVERING,
      OrderStatusEnum.DELIVERED,
    ];

    const ongoingOrders = orders.filter((order) =>
      ongoingGroup.includes(order.status as OrderStatusEnum),
    );

    const filteredOngoingOrders = await Promise.all(
      ongoingOrders.map(async (order) => {
        const items = await this.orderItemsRepository.findAndCount({
          where: { order: { id: order.id } },
          relations: ['comics'],
          take: 3,
        });
        return {
          ...order,
          items,
        };
      }),
    );

    const totalPendingAmount = ongoingOrders.reduce(
      (total, order) => total + order.totalPrice,
      0,
    );

    const successfulOrders = orders.filter(
      (order) => order.status === OrderStatusEnum.SUCCESSFUL,
    );

    return {
      orders: orders,
      ongoingOrders: filteredOngoingOrders.sort((a, b) => {
        return new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1;
      }),
      total: orders.length,
      totalSuccessful: successfulOrders.length,
      totalPendingAmount,
    };
  }

  async getOrderByDeliveryTrackingCode(code: string) {
    const order = await this.ordersRepository.findOne({
      where: { delivery: { deliveryTrackingCode: code } },
    });

    await this.autoUpdateOrderStatus(order.id);
    return await this.getOrderFullAddress(order.id);
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
    if (!order || order.status !== OrderStatusEnum.PENDING)
      throw new ForbiddenException('Only pending orders are accepted!');

    await this.eventsGateway.notifyUser(
      order.user.id,
      `Đơn hàng #${order.code} đã được người bán xác nhận. Hệ thống sẽ thông báo cho bạn khi người bán hoàn tất bàn giao truyện để giao.`,
      { orderId: orderId },
      'Đơn hàng được xác nhận',
      AnnouncementType.ORDER_CONFIRMED,
      RecipientType.USER,
      'SUCCESSFUL',
    );

    return await this.updateOrderStatus(
      orderId,
      OrderStatusEnum.PACKAGING,
    ).then(() => this.getOne(orderId));
  }

  async sellerFinishesPackaging(orderId: string, packageImages: string[]) {
    const order = await this.getOne(orderId);
    if (order.status !== OrderStatusEnum.PACKAGING)
      throw new ForbiddenException('Only packaging orders are accepted!');

    if (!packageImages || packageImages.length === 0)
      throw new ForbiddenException('No package images provided!');

    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
    });

    if (orderItemList.length === 0)
      throw new NotFoundException('No order item of the order can be found!');

    const comicsList = orderItemList.map((item) => {
      return item.comics;
    });

    await this.ordersRepository.update(orderId, {
      packageImages,
    });

    await this.deliveriesService.registerNewGHNDelivery(
      order.delivery.id,
      comicsList,
    );

    await this.eventsGateway.notifyUser(
      order.user.id,
      `Người bán đã hoàn tất quá trình đóng gói. Nhân viên giao hàng đã bắt đầu nhận hàng từ người bán để giao cho bạn.`,
      { orderId: orderId },
      'Đơn hàng bắt đầu giao',
      AnnouncementType.DELIVERY_PICKING,
      RecipientType.USER,
      'SUCCESSFUL',
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

  async updateOrderComicsStatus(orderId: string, status: ComicsStatusEnum) {
    const orderItemList = await this.orderItemsRepository.find({
      where: { order: { id: orderId } },
    });

    if (!orderItemList || orderItemList.length === 0)
      throw new NotFoundException('Cannot find any order item!');

    await Promise.all(
      orderItemList.map(async (item) => {
        await this.comicsService.updateStatus(item.comics.id, status);
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
      await this.transactionsService.createCancelledOrderTransaction(
        order.user.id,
        order.id,
        'ADD',
        order.totalPrice + order.delivery.deliveryFee,
      );

      await this.eventsGateway.notifyUser(
        order.user.id,
        `Đơn hàng #${order.code} đã bị hủy do đơn vị vận chuyển không hỗ trợ tuyến đường vận chuyển từ bạn đến người bán. ${order.paymentMethod === 'WALLET' && 'Số tiền bạn thanh toán cho đơn hàng đã được hoàn lại vào ví của bạn.'}`,
        { orderId: order.id },
        'Đơn hàng được xác nhận',
        AnnouncementType.ORDER_FAILED,
        RecipientType.USER,
        'SUCCESSFUL',
      );

      await this.usersService.updateNonWithdrawableAmount(
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

    await this.updateOrderComicsStatus(order.id, ComicsStatusEnum.SOLD);

    const seller = await this.getSellerIdOfAnOrder(order.id);

    await this.usersService.updateNWBalanceAfterOrder(
      seller.id,
      order.totalPrice,
    );

    await this.eventsGateway.notifyUser(
      seller.id,
      `Đơn hàng #${order.code} đã được người mua xác nhận thành công. Bạn đã có thể sử dụng hoặc rút số tiền của đơn hàng.`,
      { orderId: order.id },
      'Đơn hàng đã hoàn tất',
      AnnouncementType.ORDER_CONFIRMED,
      RecipientType.SELLER,
      'SUCCESSFUL',
    );

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

  async completeHangingDeliveredOrders() {
    const orders = await this.ordersRepository.find({
      where: {
        status: OrderStatusEnum.DELIVERED,
      },
    });

    return await Promise.all(
      orders.map(async (order) => {
        if (
          order.updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000 <
          new Date().getTime()
        ) {
          await this.updateOrderStatus(order.id, OrderStatusEnum.SUCCESSFUL);

          this.eventsGateway.notifyUser(
            order.delivery.from.user.id,
            `Đơn hàng #${order.code} đã được hệ thống xác nhận thành công. Bạn đã có thể sử dụng hoặc rút số tiền của đơn hàng.`,
            { orderId: order.id },
            'Đơn hàng đã hoàn tất',
            AnnouncementType.ORDER_CONFIRMED,
            RecipientType.SELLER,
          );
        }
      }),
    );
  }
}
