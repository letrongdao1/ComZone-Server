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
import { DepositsService } from '../deposits/deposits.service';
import { ExchangeStatusEnum } from '../exchanges/dto/exchange-status-enum';
import { DepositStatusEnum } from '../deposits/dto/deposit-status.enum';

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
    private readonly depositsService: DepositsService,
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

  async getByOrder(orderId: string) {
    return await this.refundRequestsRepository.findOneBy({
      order: { id: orderId },
    });
  }

  async getByExchange(userId: string, exchangeId: string) {
    const requests = await this.refundRequestsRepository.findBy({
      exchange: { id: exchangeId },
    });

    return requests.map((request) => {
      return {
        ...request,
        mine: request.user.id === userId,
      };
    });
  }

  async approveOrderRefundRequest(orderId: string) {
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

  async rejectOrderRefundRequest(orderId: string, rejectedReason: string) {
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

  async approveExchangeRefundRequest(refundRequestId: string) {
    const refundRequest = await this.refundRequestsRepository.findOneBy({
      id: refundRequestId,
    });

    if (!refundRequest)
      throw new NotFoundException('Refund request cannot be found!');

    const exchange = refundRequest.exchange;
    const totalRefundAmount =
      exchange.compensateUser &&
      exchange.compensateUser.id === refundRequest.user.id
        ? exchange.compensationAmount + exchange.depositAmount
        : exchange.depositAmount;

    await this.usersService.updateBalance(
      refundRequest.user.id,
      totalRefundAmount,
    );

    await this.transactionsService.createRefundTransaction(
      refundRequest.user.id,
      refundRequest.id,
      'ADD',
    );

    const violateUser =
      exchange.requestUser.id === refundRequest.user.id
        ? exchange.post.user
        : exchange.requestUser;

    const exchangeDeposits = await this.depositsService.getDepositsByExchange(
      violateUser.id,
      refundRequest.exchange.id,
    );

    const violateUserDeposit = exchangeDeposits.find((deposit) => deposit.mine);
    const compensatedUserDeposit = exchangeDeposits.find(
      (deposit) => !deposit.mine,
    );

    await this.depositsService.updateStatus(
      compensatedUserDeposit.id,
      DepositStatusEnum.REFUNDED,
    );

    await this.depositsService.seizeADeposit(
      violateUserDeposit.id,
      'Bồi thường tiền cho trao đổi',
    );

    await this.exchangesService.updateExchangeStatus(
      exchange.id,
      ExchangeStatusEnum.FAILED,
    );

    return await this.refundRequestsRepository
      .update(refundRequest.id, {
        status: RefundRequestStatusEnum.APPROVED,
      })
      .then(() => this.getOne(refundRequest.id));
  }

  async rejectExchangeRefundRequest(
    refundRequestId: string,
    rejectedReason: string,
  ) {
    const refundRequest = await this.refundRequestsRepository.findOneBy({
      id: refundRequestId,
    });

    if (!refundRequest) throw new NotFoundException();

    await this.exchangesService.updateExchangeStatus(
      refundRequest.exchange.id,
      ExchangeStatusEnum.FAILED,
    );

    return await this.refundRequestsRepository
      .update(refundRequest.id, {
        status: RefundRequestStatusEnum.REJECTED,
        rejectedReason,
      })
      .then(() => this.getOne(refundRequest.id));
  }
}
