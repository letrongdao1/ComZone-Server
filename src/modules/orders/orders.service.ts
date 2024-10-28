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

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(ordersRepository);
  }

  async createNewOrder(userId: string, createOrderDto: CreateOrderDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('Buyer cannot be found!');

    const seller = await this.usersService.getOne(createOrderDto.seller);
    if (!seller) throw new NotFoundException('Seller cannot be found!');

    const newOrder = this.ordersRepository.create({
      ...createOrderDto,
      seller,
      user,
      code: generateNumericCode(8),
    });

    return await this.ordersRepository.save(newOrder);
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

  async getAllOrdersOfSeller(userId: string): Promise<Order[]> {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    return await this.ordersRepository.find({
      where: {
        seller: {
          id: userId,
        },
      },
    });
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

    return await this.ordersRepository.update({ id: orderId }, { status });
  }
}
