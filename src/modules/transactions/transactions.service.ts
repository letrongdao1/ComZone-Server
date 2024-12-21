import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { generateNumericCode } from '../../utils/generator/generators';
import { TransactionStatusEnum } from './dto/transaction-status.enum';
import { Order } from 'src/entities/orders.entity';
import { Withdrawal } from 'src/entities/withdrawal.entity';
import { Deposit } from 'src/entities/deposit.entity';
import { SellerSubscription } from 'src/entities/seller-subscription.entity';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Exchange } from 'src/entities/exchange.entity';
import { RefundRequest } from 'src/entities/refund-request.entity';
import { Delivery } from 'src/entities/delivery.entity';
import { OrderStatusEnum } from '../orders/dto/order-status.enum';

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
    @InjectRepository(Delivery)
    private readonly deliveriesRepository: Repository<Delivery>,
    @InjectRepository(RefundRequest)
    private readonly refundsRepository: Repository<RefundRequest>,

    private readonly usersService: UsersService,
  ) {
    super(transactionsRepository);
  }

  async createOrderTransaction(
    userId: string,
    orderId: string,
    type: 'ADD' | 'SUBTRACT',
  ) {
    const user = await this.usersService.getOne(userId);
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (!order)
      throw new NotFoundException(
        'Order cannot be found to create transaction!',
      );

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      order,
      amount:
        type === 'SUBTRACT'
          ? order.totalPrice + order.delivery.deliveryFee
          : order.totalPrice,
      profitAmount: type === 'SUBTRACT' && order.delivery.deliveryFee,
      status: TransactionStatusEnum.SUCCESSFUL,
      type,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createCancelledOrderTransaction(
    userId: string,
    orderId: string,
    type: 'ADD' | 'SUBTRACT',
    amount: number,
  ) {
    const user = await this.usersService.getOne(userId);
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (!order)
      throw new NotFoundException(
        'Order cannot be found to create transaction!',
      );

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      order,
      amount,
      status: TransactionStatusEnum.SUCCESSFUL,
      type,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createWalletDepositTransaction(
    userId: string,
    walletDepositId: string,
    status?: TransactionStatusEnum,
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
      status: status || TransactionStatusEnum.SUCCESSFUL,
      type: 'ADD',
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

  async createDepositTransaction(
    userId: string,
    depositId: string,
    type?: 'ADD' | 'SUBTRACT',
  ) {
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
      type: type || 'SUBTRACT',
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
      profitAmount: sellerSubscription.plan.price,
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createExchangeTransaction(
    userId: string,
    exchangeId: string,
    amount: number,
    type?: 'ADD' | 'SUBTRACT',
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const exchange = await this.exchangesRepository.findOneBy({
      id: exchangeId,
    });
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const delivery = await this.deliveriesRepository.findOne({
      where: { exchange: { id: exchangeId }, to: { user: { id: userId } } },
    });

    if (!delivery)
      throw new NotFoundException('Exchange delivery cannot be found!');

    if (amount <= 0 || !delivery.deliveryFee)
      throw new BadRequestException('Invalid delivery fee!');

    const newTransaction = this.transactionsRepository.create({
      code: generateNumericCode(8),
      user,
      exchange,
      amount,
      profitAmount: delivery.deliveryFee,
      type: type || 'SUBTRACT',
      status: TransactionStatusEnum.SUCCESSFUL,
    });

    return await this.transactionsRepository.save(newTransaction);
  }

  async createRefundTransaction(
    userId: string,
    refundRequestId: string,
    type: 'ADD' | 'SUBTRACT',
  ) {
    const user = await this.usersService.getOne(userId);
    const refundRequest = await this.refundsRepository.findOneBy({
      id: refundRequestId,
    });

    if (!refundRequest)
      throw new NotFoundException('Refund request cannot be found!');

    const orderRefundAmount = refundRequest.order
      ? refundRequest.order.totalPrice +
        refundRequest.order.delivery.deliveryFee
      : 0;

    const exchangeRefundAmount = () => {
      if (!refundRequest.exchange) return;

      const exchange = refundRequest.exchange;
      return exchange.compensateUser && exchange.compensationAmount
        ? exchange.compensationAmount + exchange.depositAmount
        : exchange.depositAmount;
    };

    const newTransaction = this.transactionsRepository.create({
      user,
      code: generateNumericCode(8),
      refundRequest,
      type,
      amount: refundRequest.order ? orderRefundAmount : exchangeRefundAmount(),
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
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getSellerTransactionsData(userId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const transactions = await this.transactionsRepository.find({
      where: {
        user: {
          id: userId,
        },
        order: Not(IsNull()),
        type: 'ADD',
      },
      relations: ['order'],
      order: {
        updatedAt: 'DESC',
      },
    });

    const filteredSuccessfulOrders = transactions.filter(
      (trans) => trans.order.status === OrderStatusEnum.SUCCESSFUL,
    );

    const groups = filteredSuccessfulOrders.reduce((groups, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      const formattedDate = date.split('-').reverse().join('-');

      if (!groups[formattedDate]) {
        groups[formattedDate] = [];
      }
      groups[formattedDate].push(transaction);
      return groups;
    }, {});

    const transactionGroupsByDate = Object.keys(groups).map((date) => {
      const totalInDate = (groups[date] as Transaction[]).reduce(
        (total, transaction) => total + transaction.amount,
        0,
      );
      return {
        date,
        transactions: groups[date],
        totalInDate,
      };
    });

    const totalAmount = transactions.reduce(
      (prev, current) => prev + current.amount,
      0,
    );

    const totalUnavailableAmount = transactions.reduce((prev, current) => {
      if (current.order.status !== OrderStatusEnum.SUCCESSFUL) {
        return prev + current.amount;
      }
    }, 0);

    return {
      transactions,
      transactionGroupsByDate: transactionGroupsByDate.reverse(),
      total: transactions.length,
      totalAmount,
      totalUnavailableAmount,
    };
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
