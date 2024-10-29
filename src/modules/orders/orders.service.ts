import {
  ConflictException,
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
import { generateNumericCode } from 'src/utils/generator/generators';
import { OrderStatusEnum } from './dto/order-status.enum';
import { OrderItem } from 'src/entities/order-item.entity';
import { User } from 'src/entities/users.entity';
import { ComicService } from '../comics/comics.service';
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,

    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(ComicService) private readonly comicsService: ComicService,
  ) {
    super(ordersRepository);
  }

  async createNewOrder(userId: string, createOrderDto: CreateOrderDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newOrder = this.ordersRepository.create({
      ...createOrderDto,
      user,
      code: generateNumericCode(8),
    });

    return await this.ordersRepository.save(newOrder);
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

    return await this.ordersRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async getAllOrdersByListOfIDs(orderIds: string[]) {
    return await Promise.all(
      orderIds.map(async (id) => {
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
        return await this.getOne(id);
      }),
    );
  }

  async getOrderByCode(code: string): Promise<Order> {
    return await this.ordersRepository.findOne({
      where: { code },
    });
  }

  async updateOrderStatus(orderId: string, status: OrderStatusEnum) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) throw new NotFoundException('Order cannot be found!');

    if (order.status === status)
      throw new ConflictException(
        `This order status has already been ${order.status}`,
      );

    return await this.ordersRepository.update(orderId, { status });
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
}
