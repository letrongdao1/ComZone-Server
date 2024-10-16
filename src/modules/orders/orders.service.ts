import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Order } from 'src/entities/orders.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateOrderDTO } from './dto/createOrderDTO';
import { generateNumericCode } from 'src/utils/generator/generators';

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(ordersRepository);
  }

  async createNewOrder(createOrderDto: CreateOrderDTO) {
    const buyer = await this.usersService.getOne(createOrderDto.buyer);
    if (!buyer) throw new NotFoundException('Buyer cannot be found!');

    const seller = await this.usersService.getOne(createOrderDto.seller);
    if (!seller) throw new NotFoundException('Seller cannot be found!');

    const newOrder = this.ordersRepository.create({
      ...createOrderDto,
      seller,
      buyer,
      code: generateNumericCode(8),
    });

    return await this.ordersRepository.save(newOrder);
  }

  async getAllOrdersOfBuyer(userId: string): Promise<Order[]> {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    return await this.ordersRepository.find({
      where: {
        buyer: {
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
}
