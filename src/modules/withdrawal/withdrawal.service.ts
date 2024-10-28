import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { SourcesOfFundService } from '../sources-of-fund/sources-of-fund.service';
import { WithdrawalDTO } from './dto/withdrawal.dto';

@Injectable()
export class WithdrawalService extends BaseService<Withdrawal> {
  constructor(
    @InjectRepository(Withdrawal)
    private readonly withdrawalsRepository: Repository<Withdrawal>,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @Inject() private readonly sourcesOfFundService: SourcesOfFundService,
  ) {
    super(withdrawalsRepository);
  }

  async createWithdrawal(withdrawalDto: WithdrawalDTO) {
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

    return await this.withdrawalsRepository.save(withdrawal);
  }

  async getUserWithdrawals(userId: string) {
    return await this.withdrawalsRepository.find({
      where: { sourceOfFund: { user: { id: userId } } },
    });
  }

  async updateWithdrawalStatus(withdrawalId: string, transactionId: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
    });
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
