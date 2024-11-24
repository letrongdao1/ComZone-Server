import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  CreateExchangeRefundDTO,
  CreateOrderRefundDTO,
} from './dto/create.dto';
import { RefundRequestStatusEnum } from './dto/status.enum';
import { OrdersService } from '../orders/orders.service';
import { ExchangesService } from '../exchanges/exchanges.service';
import { OrderStatusEnum } from '../orders/dto/order-status.enum';
import { SellerDetailsService } from '../seller-details/seller-details.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class RefundRequestsService extends BaseService<RefundRequest> {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestsRepository: Repository<RefundRequest>,

    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly exchangesService: ExchangesService,
    private readonly sellerDetailsService: SellerDetailsService,
    private readonly transactionsService: TransactionsService,
  ) {
    super(refundRequestsRepository);
  }

  async createOrderRefundRequest(userId: string, dto: CreateOrderRefundDTO) {
    const order = await this.ordersService.getOne(dto.order);
    if (!order) throw new NotFoundException('Order cannot be found!');

    const user = await this.usersService.getOne(userId);
    if (order.user.id !== userId)
      throw new ForbiddenException('Invalid userID!');

    const newRequest = this.refundRequestsRepository.create({
      user,
      order,
      reason: dto.reason,
      description: dto.description,
      attachedImages: dto.attachedImages || null,
    });

    return await this.refundRequestsRepository.save(newRequest);
  }

  async createExchangeRefundRequest(
    userId: string,
    dto: CreateExchangeRefundDTO,
  ) {
    const exchange = await this.exchangesService.getOne(dto.exchange);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const user = await this.usersService.getOne(userId);
    if (exchange.requestUser.id !== userId && exchange.post.user.id !== userId)
      throw new ForbiddenException('Invalid userID!');

    const newRequest = this.refundRequestsRepository.create({
      user,
      exchange,
      reason: dto.reason,
      description: dto.description,
      attachedImages: dto.attachedImages || null,
    });

    return await this.refundRequestsRepository.save(newRequest);
  }

  async getAllRefundRequest() {
    return await this.refundRequestsRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.user', 'user')
      .leftJoinAndSelect('refund.order', 'order')
      .leftJoinAndSelect('refund.exchange', 'exchange')
      .orderBy(
        `(case when refund.status is "${RefundRequestStatusEnum.PENDING}" then 1 else null end)`,
      )
      .orderBy('refund.updatedAt', 'DESC')
      .getMany();
  }

  async getAllOrderRefundRequest() {
    return await this.refundRequestsRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.user', 'user')
      .leftJoinAndSelect('refund.order', 'order')
      .where('refund.order IS NOT NULL')
      .orderBy(
        `(case when refund.status is "${RefundRequestStatusEnum.PENDING}" then 1 else null end)`,
      )
      .orderBy('refund.updatedAt', 'DESC')
      .getMany();
  }

  async getAllExchangeRefundRequest() {
    return await this.refundRequestsRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.user', 'user')
      .leftJoinAndSelect('refund.exchange', 'exchange')
      .where('refund.exchange IS NOT NULL')
      .orderBy(
        `(case when refund.status is "${RefundRequestStatusEnum.PENDING}" then 1 else null end)`,
      )
      .orderBy('refund.updatedAt', 'DESC')
      .getMany();
  }

  async approveOrderRefund(orderId: string) {
    const refundRequest = await this.refundRequestsRepository.findOneBy({
      order: { id: orderId },
    });

    if (!refundRequest) throw new NotFoundException();

    const order = await this.ordersService.getOne(orderId);

    await this.usersService.updateBalance(order.user.id, order.totalPrice);

    await this.transactionsService.createRefundTransaction(
      order.user.id,
      refundRequest.id,
      'ADD',
    );

    const seller = await this.ordersService.getSellerIdOfAnOrder(order.id);

    await this.usersService.updateBalanceWithNonWithdrawableAmount(
      seller.id,
      -order.totalPrice,
    );

    await this.transactionsService.createRefundTransaction(
      seller.id,
      refundRequest.id,
      'SUBTRACT',
    );

    await this.sellerDetailsService.updateSellerDebt(
      seller.id,
      order.delivery.deliveryFee,
      'GAIN',
    );

    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.FAILED);

    return await this.refundRequestsRepository
      .update(refundRequest.id, {
        status: RefundRequestStatusEnum.APPROVED,
      })
      .then(() => this.getOne(refundRequest.id));
  }

  async rejectOrderRefund(orderId: string, rejectedReason: string) {
    const refundRequest = await this.refundRequestsRepository.findOneBy({
      order: { id: orderId },
    });

    if (!refundRequest) throw new NotFoundException();

    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.FAILED);

    return await this.refundRequestsRepository
      .update(refundRequest.id, {
        status: RefundRequestStatusEnum.REJECTED,
        rejectedReason,
      })
      .then(() => this.getOne(refundRequest.id));
  }

  async updateStatus(refundRequestId: string, status: RefundRequestStatusEnum) {
    const refundRequest = await this.refundRequestsRepository.findOneBy({
      id: refundRequestId,
    });
    if (!refundRequest)
      throw new NotFoundException('Refund request cannot be found!');

    return await this.refundRequestsRepository
      .update(refundRequestId, {
        status,
      })
      .then(() => this.getOne(refundRequestId));
  }
}
