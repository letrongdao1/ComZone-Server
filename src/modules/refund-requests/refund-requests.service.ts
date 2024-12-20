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
import { EventsGateway } from '../socket/event.gateway';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import { ExchangeComicsService } from '../exchange-comics/exchange-comics.service';
import { DeliveriesService } from '../deliveries/deliveries.service';

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
    private readonly comicsService: ExchangeComicsService,
    private readonly eventsGateway: EventsGateway,
    private readonly deliveriesService: DeliveriesService,
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
    const refundRequests = await this.refundRequestsRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.user', 'user')
      .leftJoinAndSelect('refund.order', 'order')
      .leftJoinAndSelect('refund.exchange', 'exchange')
      .orderBy(
        `(case when refund.status is "${RefundRequestStatusEnum.PENDING}" then 1 else null end)`,
      )
      .orderBy('refund.updatedAt', 'DESC')
      .getMany();

    if (refundRequests.length === 0) return [];

    return await Promise.all(
      refundRequests.map(async (request) => {
        if (!request.exchange) return request;

        const exchangeDelivery =
          await this.deliveriesService.getByExchangeAndToUser(
            request.user.id,
            request.exchange.id,
          );

        if (!exchangeDelivery) return request;
        else
          return {
            ...request,
            exchange: {
              ...request.exchange,
              delivery: exchangeDelivery,
            },
          };
      }),
    );
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

    await this.eventsGateway.notifyUser(
      refundRequest.user.id,
      `Yêu cầu hoàn tiền đơn hàng #${order.code} đã được hệ thống chấp thuận. Bạn có thể kiểm tra số tiền được hoàn lại từ đơn hàng trong lịch sử giao dịch.`,
      { orderId: order.id },
      'Hoàn tiền thành công',
      AnnouncementType.REFUND_APPROVE,
      RecipientType.USER,
    );

    const seller = await this.ordersService.getSellerIdOfAnOrder(order.id);

    await this.usersService.updateNonWithdrawableAmount(
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

    await this.eventsGateway.notifyUser(
      seller.id,
      `Đơn hàng #${order.code} đã bị người mua gửi yêu cầu hoàn tiền với lý do "${refundRequest.reason}". Yêu cầu đã được hệ thống phê duyệt và hoàn toàn bộ số tiền đơn hàng cho người mua.`,
      { orderId: order.id },
      'Hoàn trả đơn hàng',
      AnnouncementType.REFUND_REJECT,
      RecipientType.SELLER,
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

    const order = await this.ordersService.getOne(orderId);

    const orderSeller = await this.ordersService.getSellerIdOfAnOrder(orderId);

    await this.usersService.updateNWBalanceAfterOrder(
      orderSeller.id,
      order.totalPrice,
    );

    await this.ordersService.updateOrderStatus(orderId, OrderStatusEnum.FAILED);

    await this.eventsGateway.notifyUser(
      refundRequest.user.id,
      `Yêu cầu hoàn tiền đơn hàng của bạn đã bị từ chối. Lí do: "${rejectedReason}"`,
      { orderId: orderId },
      'Yêu càu hoàn tiền thất bại',
      AnnouncementType.REFUND_REJECT,
      RecipientType.USER,
    );

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

    await this.eventsGateway.notifyUser(
      refundRequest.user.id,
      'Yêu cầu hoàn tiền trao đổi của bạn đã được hệ thống chấp thuận. Bạn có thể kiểm tra số tiền được hoàn lại và bù cọc từ đơn hàng trong lịch sử giao dịch.',
      { exchangeId: exchange.id },
      'Hoàn và bù tiền thành công',
      AnnouncementType.REFUND_APPROVE,
      RecipientType.USER,
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
    await this.eventsGateway.notifyUser(
      violateUser.id,
      'Hệ thống đã nhận được báo cáo từ người thực hiện trao đổi với bạn và xác nhận rằng bạn đã vi phạm trong quá trình trao đổi. Hệ thống đã sử dụng số tiền cọc và tiền bù của bạn để chuyển cho người trao đổi với bạn.',
      { exchangeId: exchange.id },
      'Vi phạm trao đổi',
      AnnouncementType.EXCHANGE_REJECTED,
      RecipientType.USER,
    );

    await this.depositsService.refundDepositToAUser(compensatedUserDeposit.id);

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

    if (!refundRequest || !refundRequest.exchange)
      throw new NotFoundException();

    await this.eventsGateway.notifyUser(
      refundRequest.user.id,
      `Yêu cầu hoàn tiền trao đổi của bạn đã bị từ chối. Lí do: "${rejectedReason}"`,
      { exchangeId: refundRequest.exchange.id },
      'Yêu càu hoàn tiền thất bại',
      AnnouncementType.REFUND_REJECT,
      RecipientType.USER,
    );

    await this.depositsService.refundAllDepositsOfAnExchange(
      refundRequest.exchange.id,
    );
    await this.exchangesService.transferCompensationAmount(
      refundRequest.exchange.id,
    );
    await this.comicsService.completeExchangeComics(refundRequest.exchange.id);

    await this.exchangesService.updateExchangeStatus(
      refundRequest.exchange.id,
      ExchangeStatusEnum.SUCCESSFUL,
    );

    return await this.refundRequestsRepository
      .update(refundRequest.id, {
        status: RefundRequestStatusEnum.REJECTED,
        rejectedReason,
      })
      .then(() => this.getOne(refundRequest.id));
  }
}
