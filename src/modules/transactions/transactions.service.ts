import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { TransactionDTO } from './dto/transactionDto';
import { generateNumericCode } from '../../utils/generator/generators';
import { OrdersService } from '../orders/orders.service';
import { WalletDepositService } from '../wallet-deposit/wallet-deposit.service';
import { WithdrawalService } from '../withdrawal/withdrawal.service';
import { ProviderEnum } from './dto/provider.enum';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly walletDepositService: WalletDepositService,
    private readonly withdrawalService: WithdrawalService,
  ) {
    super(transactionsRepository);
  }

  async createNewTransaction(
    userId: string,
    transactionDto: TransactionDTO,
  ): Promise<Transaction> {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      provider: transactionDto.provider,
      status: transactionDto.status,
    });

    if (transactionDto.order) {
      const order = await this.ordersService.getOne(transactionDto.order);
      if (!order) throw new NotFoundException('Order cannot be found!');
      newTransaction.order = order;
      newTransaction.amount = order.totalPrice;
    }

    if (transactionDto.walletDeposit) {
      const walletDeposit = await this.walletDepositService.getOne(
        transactionDto.walletDeposit,
      );
      if (!walletDeposit)
        throw new NotFoundException('Wallet deposit cannot be found!');
      newTransaction.walletDeposit = walletDeposit;
      newTransaction.amount = walletDeposit.amount;
    }

    if (transactionDto.withdrawal) {
      const withdrawal = await this.withdrawalService.getOne(
        transactionDto.withdrawal,
      );
      if (!withdrawal)
        throw new NotFoundException('Withdrawal cannot be found!');
      newTransaction.withdrawal = withdrawal;
      newTransaction.amount = withdrawal.amount;
    }

    return await this.transactionsRepository.save(newTransaction);
  }

  async getAllTransactionsOfUser(userId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    return await this.transactionsRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
  }

  async getTransactionByCode(code: string) {
    return await this.transactionsRepository.findOne({
      where: { code },
    });
  }

  async updateTransactionStatus(
    transactionId: string,
    newStatus: 'PENDING' | 'SUCCESSFUL' | 'FAILED',
  ) {
    const transaction = await this.transactionsRepository.findOne({
      where: {
        id: transactionId,
      },
    });

    if (!transaction)
      throw new NotFoundException('Transaction cannot be found!');

    if (transaction.status === newStatus)
      return {
        message: `This transaction status has already been '${newStatus}'`,
      };

    return await this.transactionsRepository.update(
      { id: transactionId },
      { status: newStatus },
    );
  }

  async updateTransactionProvider(
    transactionId: string,
    provider: ProviderEnum,
  ) {
    return await this.transactionsRepository
      .update(transactionId, {
        provider,
      })
      .then(() => this.getOne(transactionId));
  }

  async updateTransactionIsUsed(transactionId: string) {
    const transaction = await this.transactionsRepository.findOne({
      where: { id: transactionId },
    });

    await this.transactionsRepository.update(transactionId, {
      isUsed: !transaction.isUsed,
    });

    return {
      message: transaction.isUsed
        ? 'Updated this transaction to not used yet!'
        : 'Successfully updated this transaction to be already used!',
    };
  }

  async updatePostTransaction(transactionId: string) {
    const transaction = await this.getOne(transactionId);

    if (!transaction)
      throw new NotFoundException('Transaction cannot be found!');

    console.log({ transaction });

    if (transaction.order) {
      console.log('NICE');
      return await this.ordersService
        .updateOrderIsPaid(transaction.order.id, true)
        .then(() => this.ordersService.getOne(transaction.order.id));
    }

    if (transaction.walletDeposit) {
      return await this.walletDepositService
        .updateWalletDepositStatus(transaction.walletDeposit.id, transaction.id)
        .then(() =>
          this.walletDepositService.getOne(transaction.walletDeposit.id),
        );
    }

    if (transaction.withdrawal) {
      return await this.withdrawalService
        .updateWithdrawalStatus(transaction.withdrawal.id, transaction.id)
        .then(() => this.withdrawalService.getOne(transaction.withdrawal.id));
    }
  }
}
