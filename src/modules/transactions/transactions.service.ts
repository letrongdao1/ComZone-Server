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
import { generateNumericCode } from '../../utils/generator/generators';
import { TransactionStatusEnum } from './dto/transaction-status.enum';
import { Order } from 'src/entities/orders.entity';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Deposit } from 'src/entities/deposit.entity';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Exchange } from 'src/entities/exchange.entity';

@Injectable()
export class TransactionsService extends BaseService<Transaction> {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(WalletDeposit)
    private readonly walletDepositsRepository: Repository<WalletDeposit>,
    @InjectRepository(Withdrawal)
    private readonly withdrawalsRepository: Repository<Withdrawal>,
    @InjectRepository(Deposit)
    private readonly depositsRepository: Repository<Deposit>,
    @InjectRepository(SellerSubscription)
    private readonly sellerSubscriptionsRepository: Repository<SellerSubscription>,
    @InjectRepository(Exchange)
    private readonly exchangesRepository: Repository<Exchange>,

    private readonly usersService: UsersService,
  ) {
    super(transactionsRepository);
  }

  async createOrderTransaction(userId: string, orderId: string) {
    const user = await this.usersService.getOne(userId);
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (!order) throw new NotFoundException('Order cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      order,
      amount: order.totalPrice,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createWalletDepositTransaction(
    userId: string,
    walletDepositId: string,
  ) {
    const user = await this.usersService.getOne(userId);
    const walletDeposit = await this.walletDepositsRepository.findOneBy({
      id: walletDepositId,
    });
    if (!walletDeposit)
      throw new NotFoundException('Wallet deposit cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      walletDeposit,
      amount: walletDeposit.amount,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createWithdrawalTransaction(userId: string, withdrawalId: string) {
    const user = await this.usersService.getOne(userId);
    const withdrawal = await this.withdrawalsRepository.findOneBy({
      id: withdrawalId,
    });
    if (!withdrawal) throw new NotFoundException('Withdrawal cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      withdrawal,
      amount: withdrawal.amount,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createDepositTransaction(userId: string, depositId: string) {
    const user = await this.usersService.getOne(userId);
    const deposit = await this.depositsRepository.findOneBy({
      id: depositId,
    });
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      deposit,
      amount: deposit.amount,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createSellerSubscriptionTransaction(
    userId: string,
    sellerSubscriptionId: string,
  ) {
    const user = await this.usersService.getOne(userId);
    const sellerSubscription =
      await this.sellerSubscriptionsRepository.findOneBy({
        id: sellerSubscriptionId,
      });
    if (!sellerSubscription)
      throw new NotFoundException('Seller subscription cannot be found!');

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      sellerSubscription,
      amount: sellerSubscription.plan.price,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createExchangeTransaction(
    userId: string,
    exchangeId: string,
    amount: number,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (amount <= 0) throw new BadRequestException('Invalid delivery fee!');

    const newTransaction = this.transactionsRepository.create({
      code: generateNumericCode(8),
      user,
      exchange,
      amount,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

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

  async getSuccessfulExchangeTransaction(
    userId: string,
    exchangeId: string,
    belongTo: 'self' | 'other',
  ) {
    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });
    const self =
      exchange.requestUser.id === userId
        ? exchange.requestUser
        : exchange.post.user;

    const other =
      exchange.requestUser.id === userId
        ? exchange.post.user
        : exchange.requestUser;

    return await this.transactionsRepository.findOne({
      where: {
        user: { id: belongTo === 'self' ? self.id : other.id },
        exchange: { id: exchangeId },
        status: TransactionStatusEnum.SUCCESSFUL,
      },
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

  // async updatePostTransaction(transactionId: string) {
  //   const transaction = await this.getOne(transactionId);

  //   if (!transaction)
  //     throw new NotFoundException('Transaction cannot be found!');

  //   if (transaction.isUsed)
  //     throw new ForbiddenException(
  //       'Transaction has been solved and cannot be adjust anymore!',
  //     );

  //   //Order
  //   if (transaction.order) {
  //     if (transaction.order.isPaid)
  //       throw new ForbiddenException('This order has already been paid!');

  //     const user = await this.usersService.userWalletOrderPay(
  //       transaction.order.id,
  //     );

  //     const order = await this.ordersService.getOne(transaction.order.id);
  //     if (order.isPaid)
  //       await this.transactionsRepository.update(transaction.id, {
  //         status: 'SUCCESSFUL',

  //       });

  //     const seller = await this.ordersService.getSellerIdOfAnOrder(
  //       transaction.order.id,
  //     );

  //     await this.usersService.updateBalanceWithNonWithdrawableAmount(
  //       seller.id,
  //       transaction.order.totalPrice,
  //     );

  //     await this.ordersService.updateComicsStatusOfAnOrder(
  //       transaction.order.id,
  //       'SOLD',
  //     );

  //     const trans = await this.getOne(transactionId);

  //     return {
  //       transaction: {
  //         id: trans.id,
  //         code: trans.code,
  //         status: trans.status,
  //       },
  //       user: user.balance,
  //       seller: {
  //         balance: seller.balance,
  //         nonWithdrawableAmount: seller.nonWithdrawableAmount,
  //       },
  //     };
  //   }

  //   //Wallet deposit
  //   if (transaction.walletDeposit) {
  //     const trans = await this.walletDepositService.updateWalletDepositStatus(
  //       transaction.walletDeposit.id,
  //       transaction.id,
  //     );

  //     const user = await this.usersService.depositWallet(
  //       transaction.walletDeposit.id,
  //     );

  //     await this.updateTransactionIsUsed(transaction.id);

  //     return {
  //       transaction: trans,
  //       user,
  //     };
  //   }

  //   //Wallet withdrawal
  //   if (transaction.withdrawal) {
  //     return await this.withdrawalService
  //       .updateWithdrawalStatus(transaction.withdrawal.id, transaction.id)
  //       .then(() => this.withdrawalService.getOne(transaction.withdrawal.id));
  //   }
  // }
}
