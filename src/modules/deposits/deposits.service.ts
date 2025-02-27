import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Deposit } from 'src/entities/deposit.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { ExchangeDepositDTO } from './dto/create-deposit.dto';
import { UsersService } from '../users/users.service';
import { AuctionService } from '../auction/auction.service';
import { DepositStatusEnum } from './dto/deposit-status.enum';
import { ExchangesService } from '../exchanges/exchanges.service';
import { TransactionsService } from '../transactions/transactions.service';
import { EventsGateway } from '../socket/event.gateway';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';
import CurrencySplitter from 'src/utils/currency-spliter/CurrencySplitter';

@Injectable()
export class DepositsService extends BaseService<Deposit> {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositsRepository: Repository<Deposit>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(forwardRef(() => AuctionService))
    private auctionService: AuctionService,
    @Inject(forwardRef(() => ExchangesService))
    private readonly exchangesService: ExchangesService,
    @Inject(forwardRef(() => EventsGateway))
    private readonly eventsGateway: EventsGateway,
    @Inject(TransactionsService)
    private readonly transactionsService: TransactionsService,
  ) {
    super(depositsRepository);
  }

  async placeDeposit(userId: string, auctionId: string) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    let auction;
    if (auctionId) {
      auction = await this.auctionService.findAuctionById(auctionId);
      if (!auction) throw new NotFoundException('Auction not found!');
    }
    const amount = auction.depositAmount;

    if (amount <= 0 || amount > 999999999) {
      throw new BadRequestException('Invalid amount!');
    }

    if (user.balance < amount) {
      throw new ForbiddenException('Insufficient balance!');
    }

    // Create the deposit object
    const deposit = this.depositsRepository.create({
      user,
      auction,
      amount,
      status: DepositStatusEnum.HOLDING,
    });

    // Save the deposit to get the ID
    const savedDeposit = await this.depositsRepository.save(deposit);

    // Deduct balance from the user
    await this.usersService.updateBalance(userId, -amount);
    // Create a transaction with the deposit ID
    const transaction = await this.transactionsService.createDepositTransaction(
      userId,
      savedDeposit.id,
    );

    // await this.eventsGateway.notifyUser(
    //   userId,
    //   `Bạn đã đặt cọc thành công số tiền ${CurrencySplitter(amount)}đ cho cuộc đấu giá.`,
    //   { auctionId: auction },
    //   'Đặt cọc thành công',
    //   AnnouncementType.TRANSACTION_SUBTRACT,
    //   RecipientType.USER,
    // );

    console.log('Transaction:', transaction);

    return savedDeposit;
  }

  async placeExchangeDeposit(userId: string, dto: ExchangeDepositDTO) {
    const user = await this.usersService.getOne(userId);

    const exchange = await this.exchangesService.getOne(dto.exchange);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    if (!exchange.depositAmount || exchange.depositAmount === 0)
      throw new NotFoundException(
        'Exchange deposit amount is yet initialized!',
      );

    if (user.balance < exchange.depositAmount)
      throw new ForbiddenException('Insufficient balance!');

    const checkDeposit = await this.depositsRepository.findOne({
      where: {
        user: { id: userId },
        exchange: { id: dto.exchange },
      },
    });

    if (checkDeposit) return;

    const newDeposit = this.depositsRepository.create({
      user,
      exchange,
      amount: exchange.depositAmount,
      status: DepositStatusEnum.HOLDING,
    });

    await this.usersService.updateBalance(userId, -exchange.depositAmount);

    await this.depositsRepository.save(newDeposit);

    await this.transactionsService.createDepositTransaction(
      userId,
      newDeposit.id,
    );

    await this.eventsGateway.notifyUser(
      userId,
      `Bạn đã đặt cọc thành công số tiền ${CurrencySplitter(exchange.depositAmount)}đ cho một cuộc trao đổi.`,
      { exchangeId: exchange.id },
      'Đặt cọc thành công',
      AnnouncementType.TRANSACTION_SUBTRACT,
      RecipientType.USER,
    );

    await this.exchangesService.updateExchangeDeliveryConfirmExpiration(
      userId,
      dto.exchange,
    );
  }

  async getAllDepositOfUser(userId: string) {
    return await this.depositsRepository.find({
      where: { user: { id: userId } },
    });
  }
  async getUserDepositOfAnAuction(userId: string, auctionId: string) {
    return await this.depositsRepository.findOne({
      where: {
        user: { id: userId }, // Match the user by ID
        auction: { id: auctionId }, // Match the auction by ID
      },
    });
  }
  async getUserDepositsWithAuction(userId: string): Promise<Deposit[]> {
    return await this.depositsRepository.find({
      where: {
        user: { id: userId },
        auction: Not(IsNull()),
      },
      relations: ['user', 'auction'],
      order: {
        createdAt: 'DESC',
      },
    });
  }
  async getAllDepositOfAnAuction(auctionId: string): Promise<Deposit[]> {
    return await this.depositsRepository.find({
      where: { auction: { id: auctionId } },
    });
  }

  async getDepositsByExchange(userId: string, exchangeId: string) {
    const deposits = await this.depositsRepository.find({
      where: { exchange: { id: exchangeId } },
    });
    return await Promise.all(
      deposits.map((deposit) => {
        return {
          ...deposit,
          mine: deposit.user.id === userId,
        };
      }),
    );
  }

  async refundDepositToAUser(depositId: string) {
    const deposit = await this.getOne(depositId);
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    if (deposit.status !== DepositStatusEnum.HOLDING)
      throw new BadRequestException(
        'This deposit is not being held by the system!',
      );

    await this.usersService.updateBalance(deposit.user.id, deposit.amount);

    const transaction = await this.transactionsService.createDepositTransaction(
      deposit.user.id,
      deposit.id,
      'ADD',
    );

    await this.eventsGateway.notifyUser(
      deposit.user.id,
      `Hệ thống đã hoàn số tiền cọc ${CurrencySplitter(deposit.amount)}đ vào ví của bạn.`,
      { transactionId: transaction.id },
      'Hoàn cọc thành công',
      AnnouncementType.TRANSACTION_ADD,
      RecipientType.USER,
    );

    return await this.depositsRepository
      .update(depositId, {
        status: DepositStatusEnum.REFUNDED,
      })
      .then(() => this.getOne(depositId));
  }

  async refundAllDepositsExceptWinner(auctionId: string, winnerId: string) {
    const deposits = await this.depositsRepository.find({
      where: { auction: { id: auctionId } },
      relations: ['user'],
    });

    const depositsToRefund = deposits.filter(
      (deposit) =>
        deposit.user.id !== winnerId &&
        deposit.status === DepositStatusEnum.HOLDING,
    );

    await Promise.all(
      depositsToRefund.map((deposit) => this.refundDepositToAUser(deposit.id)),
    );

    return {
      message: `Refunded deposits to ${depositsToRefund.length} losing bidders.`,
    };
  }

  async refundDepositToWinner(auctionId: string) {
    const auction = await this.auctionService.findAuctionById(auctionId);
    if (!auction) throw new NotFoundException('Auction cannot be found!');

    if (!auction.winner)
      throw new BadRequestException('Auction has no winner!');

    const winnerDeposit = await this.depositsRepository.findOne({
      where: {
        auction: { id: auctionId },
        user: { id: auction.winner.id },
      },
    });

    if (!winnerDeposit)
      throw new NotFoundException('Winner deposit cannot be found!');

    if (winnerDeposit.status !== DepositStatusEnum.HOLDING)
      throw new BadRequestException(
        'The winner deposit is not being held by the system!',
      );

    const totalPayment = auction.currentPrice;
    const depositAmount = winnerDeposit.amount;

    if (depositAmount >= totalPayment) {
      const refundAmount = depositAmount - totalPayment;

      if (refundAmount > 0) {
        // await this.usersService.updateBalance(
        //   winnerDeposit.user.id,
        //   refundAmount,
        // );
      }
      // const transaction =
      //   await this.transactionsService.createDepositTransaction(
      //     winnerDeposit.user.id,
      //     winnerDeposit.id,
      //     'ADD',
      //   );
      // await this.eventsGateway.notifyUser(
      //   winnerDeposit.user.id,
      //   `Số tiền dư còn lại sau khi thanh toán bằng cọc ${CurrencySplitter(refundAmount)}đ đã được hoàn trả.`,
      //   { transactionId: transaction.id },
      //   'Hoàn cọc thành công',
      //   AnnouncementType.TRANSACTION_ADD,
      //   RecipientType.USER,
      // );
      await this.depositsRepository.update(winnerDeposit.id, {
        status: DepositStatusEnum.USED,
      });
    } else {
      // const remainingPayment = totalPayment - depositAmount;

      await this.depositsRepository.update(winnerDeposit.id, {
        status: DepositStatusEnum.USED,
      });
    }

    // Record the transaction
    // const transaction = await this.transactionsService.createDepositTransaction(
    //   winnerDeposit.user.id,
    //   winnerDeposit.id,
    //   'ADD',
    // );

    // await this.eventsGateway.notifyUser(
    //   winnerDeposit.user.id,
    //   `Hệ thống đã hoàn tất xử lý số tiền cọc ${CurrencySplitter(depositAmount)}đ.`,
    //   { transactionId: transaction.id },
    //   'Hoàn cọc thành công',
    //   AnnouncementType.TRANSACTION_ADD,
    //   RecipientType.USER,
    // );

    return this.getOne(winnerDeposit.id);
  }

  async refundAllDepositsOfAnExchange(exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const depositList = await this.depositsRepository.find({
      where: { exchange: { id: exchangeId } },
    });

    return await Promise.all(
      depositList.map(async (deposit) => {
        if (deposit.status !== DepositStatusEnum.HOLDING) return;
        await this.refundDepositToAUser(deposit.id);
      }),
    ).then(() => {
      return {
        message: `Deposits of the exchange are successfully refunded to ${depositList.length} user(s).`,
      };
    });
  }

  async refundExpiredExchange(userId: string, exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);

    if (!exchange) throw new NotFoundException();

    await this.refundAllDepositsOfAnExchange(exchangeId);

    await this.exchangesService.revertCompensationAmount(
      exchangeId,
      'Trao đổi bị hủy do người thực hiện trao đổi không xác nhận bàn giao truyện đúng hạn',
    );

    await this.exchangesService.updateAfterExchangeExpired(userId, exchangeId);
  }

  async seizeADeposit(depositId: string, seizedReason: string) {
    const deposit = await this.getOne(depositId);
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    return await this.depositsRepository
      .update(depositId, {
        status: 'SEIZED',
        seizedReason,
      })
      .then(() => this.getOne(depositId));
  }

  async seizeADepositAuction(depositId: string) {
    const deposit = await this.getOne(depositId);
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    if (deposit.status !== DepositStatusEnum.HOLDING) {
      throw new BadRequestException('Only holding deposits can be seized!');
    }

    let seller;
    let auction;

    // Check if the deposit is tied to an auction
    if (deposit.auction) {
      auction = await this.auctionService.findAuctionById(deposit.auction.id);
      if (!auction) throw new NotFoundException('Auction cannot be found!');
      seller = auction.comics?.sellerId; // Ensure the auction has a seller
    }

    if (!seller) {
      throw new BadRequestException(
        'No associated seller found for this deposit!',
      );
    }

    // Update seller's balance
    await this.usersService.updateBalance(seller.id, deposit.amount);

    // Create a transaction for the seized deposit
    await this.transactionsService.createDepositTransaction(
      seller.id,
      deposit.id,
      'ADD',
    );

    // Update the deposit status to SEIZED
    await this.depositsRepository.update(depositId, {
      status: DepositStatusEnum.SEIZED,
    });

    return this.getOne(depositId);
  }

  async updateStatus(depositId: string, status: DepositStatusEnum) {
    return await this.depositsRepository.update(depositId, {
      status,
    });
  }
}
