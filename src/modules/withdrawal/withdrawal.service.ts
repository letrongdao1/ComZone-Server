import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { SourcesOfFundService } from '../sources-of-fund/sources-of-fund.service';
import { WithdrawalDTO } from './dto/withdrawal.dto';
import { EventsGateway } from '../socket/event.gateway';
import { TransactionsService } from '../transactions/transactions.service';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import { UsersService } from '../users/users.service';
import CurrencySplitter from 'src/utils/currency-spliter/CurrencySplitter';

@Injectable()
export class WithdrawalService extends BaseService<Withdrawal> {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalsRepository: Repository<Withdrawal>,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly sourcesOfFundService: SourcesOfFundService,
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,
    @Inject(EventsGateway) private readonly eventsGateway: EventsGateway,
  ) {
    super(withdrawalsRepository);
  }

  async createWithdrawal(userId: string, withdrawalDto: WithdrawalDTO) {
    const sourceOfFund = await this.sourcesOfFundService.getOne(
      withdrawalDto.sourceOfFund,
    );
    if (!sourceOfFund)
      throw new NotFoundException('Source of fund cannot be found!');

    const withdrawal = this.withdrawalsRepository.create({
      sourceOfFund,
      amount: withdrawalDto.amount,
      status: 'PENDING',
    });

    await this.withdrawalsRepository.save(withdrawal);

    await this.usersService.updateBalance(userId, -withdrawalDto.amount);

    const transaction =
      await this.transactionsService.createWithdrawalTransaction(
        userId,
        withdrawal.id,
      );

    await this.eventsGateway.notifyUser(
      userId,
      `Bạn đã thực hiện rút ${CurrencySplitter(withdrawalDto.amount)}đ về tài khoản ngân hàng của bạn từ ví ComZone.`,
      { transactionId: transaction.id },
      'Rút tiền thành công',
      AnnouncementType.TRANSACTION_SUBTRACT,
      RecipientType.USER,
    );

    return await this.getOne(withdrawal.id);
  }

  async getUserWithdrawals(userId: string) {
    return await this.withdrawalsRepository.find({
      where: { sourceOfFund: { user: { id: userId } } },
    });
  }

  async updateWithdrawalStatus(withdrawalId: string, transactionId: string) {
    const transaction = await this.transactionsService.getOne(transactionId);
    if (!transaction)
      throw new NotFoundException('Transaction cannot be found!');

    const withdrawal = await this.getOne(withdrawalId);
    if (!withdrawal) throw new NotFoundException('Withdrawal cannot be found!');

    await this.withdrawalsRepository.update(withdrawalId, {
      status: transaction.status === 'SUCCESSFUL' ? 'SUCCESSFUL' : 'FAILED',
    });

    return withdrawal;
  }
}
