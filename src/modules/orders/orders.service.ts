import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Order } from 'src/entities/orders.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';

@Injectable()
export class OrdersService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {
    super(ordersRepository);
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
}
