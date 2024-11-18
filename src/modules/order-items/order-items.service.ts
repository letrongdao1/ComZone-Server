import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { OrderItem } from 'src/entities/order-item.entity';
import { Repository } from 'typeorm';
import { OrdersService } from '../orders/orders.service';
import { CreateOrderItemDTO } from './dto/createOrderItemDTO';
import { ComicService } from '../comics/comics.service';

@Injectable()
export class OrderItemsService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @Inject() private readonly ordersService: OrdersService,
    @Inject() private readonly comicsService: ComicService,
  ) {
    super(orderItemsRepository);
  }

  async getAllItemsOfOrder(orderId: string): Promise<OrderItem[]> {
    const order = await this.ordersService.getOne(orderId);
    if (!order) throw new NotFoundException('Order cannot be found!');
    return await this.orderItemsRepository.find({
      where: {
        order: {
          id: orderId,
        },
      },
    });
  }

  async create(orderItem: CreateOrderItemDTO): Promise<any> {
    const { order: orderId, comics: comicsId } = orderItem;
    console.log(comicsId);

    if (!orderId) throw new BadRequestException('Invalid order id!');

    const fetchedOrder = await this.ordersService.getOne(orderId);
    if (!fetchedOrder) throw new NotFoundException('Order cannot be found!');

    if (!comicsId) throw new BadRequestException('Invalid comics id!');

    const fetchedComics = await this.comicsService.findOne(comicsId);
    if (!fetchedComics) throw new NotFoundException('Comics cannot be found!');

    const checkOrderItem = await this.orderItemsRepository.findOne({
      where: {
        order: {
          id: orderId,
        },
        comics: {
          id: comicsId,
        },
      },
    });
    if (checkOrderItem) throw new ConflictException('Duplicated order item!');

    return await this.orderItemsRepository.save({
      order: fetchedOrder,
      comics: fetchedComics,
      price: fetchedComics.price,
    });
  }
}
