import {
  BadRequestException,
  ForbiddenException,
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
import { PaymentGatewayEnum } from './dto/provider.enum';
import { DepositsService } from '../deposits/deposits.service';
import { SellerSubscriptionsService } from '../seller-subscriptions/seller-subscriptions.service';
import { TransactionStatusEnum } from './dto/transaction-status.enum';
import { ExchangesService } from '../exchanges/exchanges.service';
import { DeliveriesService } from '../deliveries/deliveries.service';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly walletDepositService: WalletDepositService,
    private readonly withdrawalService: WithdrawalService,
    private readonly depositsService: DepositsService,
    private readonly sellerSubscriptionsService: SellerSubscriptionsService,
    private readonly exchangesService: ExchangesService,
    private readonly deliveriesService: DeliveriesService,
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
      paymentGateway: transactionDto.paymentGateway,
      status: transactionDto.status,
    });

    if (transactionDto.order) {
      const order = await this.ordersService.getOne(transactionDto.order);

      if (!order) throw new NotFoundException('Order cannot be found!');
      newTransaction.order = order;
      newTransaction.amount = order.totalPrice;
    } else if (transactionDto.walletDeposit) {
      const walletDeposit = await this.walletDepositService.getOne(
        transactionDto.walletDeposit,
      );

      if (!walletDeposit)
        throw new NotFoundException('Wallet deposit cannot be found!');
      newTransaction.walletDeposit = walletDeposit;
      newTransaction.amount = walletDeposit.amount;
    } else if (transactionDto.withdrawal) {
      const withdrawal = await this.withdrawalService.getOne(
        transactionDto.withdrawal,
      );

      if (!withdrawal)
        throw new NotFoundException('Withdrawal cannot be found!');
      newTransaction.withdrawal = withdrawal;
      newTransaction.amount = withdrawal.amount;
    } else if (transactionDto.deposit) {
      const deposit = await this.depositsService.getOne(transactionDto.deposit);

      if (!deposit) throw new NotFoundException('Deposit cannot be found!');
      newTransaction.deposit = deposit;
      newTransaction.amount = deposit.amount;
      newTransaction.status = TransactionStatusEnum.SUCCESSFUL;
      newTransaction.isUsed = true;
    }

    return await this.transactionsRepository.save(newTransaction);
  }

  async createExchangeTransaction(userId: string, exchangeId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    let newTransaction: Transaction;
    if (exchange.post.user.id === userId) {
      newTransaction.exchange = exchange;
      newTransaction.amount =
        exchange.depositAmount + exchange.compensationAmount;
    }
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

    return await this.transactionsRepository.update(transactionId, {
      status: newStatus,
    });
  }

  async updateTransactionProvider(
    transactionId: string,
    paymentGateway: PaymentGatewayEnum,
  ) {
    return await this.transactionsRepository
      .update(transactionId, {
        paymentGateway,
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

    if (transaction.isUsed)
      throw new ForbiddenException(
        'Transaction has been solved and cannot be adjust anymore!',
      );

    //Order
    if (transaction.order) {
      if (transaction.order.isPaid)
        throw new ForbiddenException('This order has already been paid!');

      const user = await this.usersService.userWalletOrderPay(
        transaction.order.id,
      );

      const order = await this.ordersService.getOne(transaction.order.id);
      if (order.isPaid)
        await this.transactionsRepository.update(transaction.id, {
          status: 'SUCCESSFUL',
          isUsed: true,
        });

      const seller = await this.ordersService.getSellerIdOfAnOrder(
        transaction.order.id,
      );

      await this.usersService.updateBalanceWithNonWithdrawableAmount(
        seller.id,
        transaction.order.totalPrice,
      );

      await this.ordersService.updateComicsStatusOfAnOrder(
        transaction.order.id,
        'SOLD',
      );

      const trans = await this.getOne(transactionId);

      return {
        transaction: {
          id: trans.id,
          code: trans.code,
          status: trans.status,
        },
        user: user.balance,
        seller: {
          balance: seller.balance,
          nonWithdrawableAmount: seller.nonWithdrawableAmount,
        },
      };
    }

    //Wallet deposit
    if (transaction.walletDeposit) {
      const trans = await this.walletDepositService.updateWalletDepositStatus(
        transaction.walletDeposit.id,
        transaction.id,
      );

      const user = await this.usersService.depositWallet(
        transaction.walletDeposit.id,
      );

      await this.updateTransactionIsUsed(transaction.id);

      return {
        transaction: trans,
        user,
      };
    }

    //Wallet withdrawal
    if (transaction.withdrawal) {
      return await this.withdrawalService
        .updateWithdrawalStatus(transaction.withdrawal.id, transaction.id)
        .then(() => this.withdrawalService.getOne(transaction.withdrawal.id));
    }
  }
}
