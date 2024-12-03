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
import { ComicsStatusEnum } from '../comics/dto/comic-status.enum';
import { EventsGateway } from '../socket/event.gateway';
import { RecipientType } from 'src/entities/announcement.entity';

@Injectable()
export class OrderItemsService extends BaseService<OrderItem> {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @Inject() private readonly ordersService: OrdersService,
    @Inject() private readonly comicsService: ComicService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
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
    const { order: orderId, comics: comicsId, price } = orderItem;

    // Validate order ID
    if (!orderId) throw new BadRequestException('Invalid order id!');

    const fetchedOrder = await this.ordersService.getOne(orderId);
    if (!fetchedOrder) throw new NotFoundException('Order cannot be found!');

    // Validate comics ID
    if (!comicsId) throw new BadRequestException('Invalid comics id!');

    const fetchedComics = await this.comicsService.findOne(comicsId);
    if (!fetchedComics) throw new NotFoundException('Comics cannot be found!');

    // Check for duplicate order items
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

    // Resolve price: use provided price if available, otherwise default to comic's price
    const resolvedPrice = price ?? fetchedComics.price;
    if (resolvedPrice == null) {
      throw new BadRequestException('Price cannot be null!');
    }

    await this.comicsService.updateStatus(
      orderItem.comics,
      ComicsStatusEnum.PRE_ORDER,
    );

    this.eventsGateway.notifyUser(
      fetchedComics.sellerId.id,
      `Truyện "${fetchedComics.title}" vừa được đặt hàng.`,
      { orderId: fetchedOrder.id },
      'Đơn hàng',
      'ORDER',
      RecipientType.SELLER,
    );
    // Save order item
    return await this.orderItemsRepository.save({
      order: fetchedOrder,
      comics: fetchedComics,
      price: resolvedPrice,
    });
  }
}
