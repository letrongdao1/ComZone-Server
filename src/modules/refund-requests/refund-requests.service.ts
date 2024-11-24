import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Exchange } from 'src/entities/exchange.entity';
import { Order } from 'src/entities/orders.entity';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  CreateExchangeRefundDTO,
  CreateOrderRefundDTO,
} from './dto/create.dto';
import { RefundRequestStatusEnum } from './dto/status.enum';

@Injectable()
export class RefundRequestsService extends BaseService<RefundRequest> {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestsRepository: Repository<RefundRequest>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,

    private readonly usersService: UsersService,
  ) {
    super(refundRequestsRepository);
  }

  async createOrderRefundRequest(userId: string, dto: CreateOrderRefundDTO) {
    const order = await this.ordersRepository.findOneBy({ id: dto.order });
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
    const exchange = await this.exchangesRepository.findOneBy({
      id: dto.exchange,
    });
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
      .orderBy(
        `(case when refund.status is "${RefundRequestStatusEnum.PENDING}" then 1 else null end)`,
      )
      .orderBy('refund.updatedAt', 'DESC')
      .getMany();
  }

  async getAllOrderRefundRequest() {
    return await this.refundRequestsRepository
      .createQueryBuilder('refund')
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
