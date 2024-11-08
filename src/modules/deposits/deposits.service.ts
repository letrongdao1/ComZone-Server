import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Deposit } from 'src/entities/deposit.entity';
import { Repository } from 'typeorm';
import { CreateDepositDTO } from './dto/create-deposit.dto';
import { UsersService } from '../users/users.service';
import { AuctionService } from '../auction/auction.service';
import { ExchangesService } from '../exchanges/exchanges.service';

@Injectable()
export class DepositsService extends BaseService<Deposit> {
  constructor(
    @InjectRepository(Deposit)
    private readonly depositsRepository: Repository<Deposit>,
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(AuctionService) private readonly auctionsService: AuctionService,
    @Inject(ExchangesService)
    private readonly exchangesService: ExchangesService,
  ) {
    super(depositsRepository);
  }

  async placeDeposit(userId: string, createDepositDto: CreateDepositDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    if (createDepositDto.amount <= 0 || createDepositDto.amount > 999999999)
      throw new BadRequestException('Invalid amount!');

    if (user.balance < createDepositDto.amount)
      throw new ForbiddenException('Insufficient balance!');

    let deposit: Deposit;

    if (createDepositDto.auction) {
      const auction = await this.auctionsService.findAuctionById(
        createDepositDto.auction,
      );

      deposit = this.depositsRepository.create({
        user,
        auction,
        amount: createDepositDto.amount,
        status: 'HOLDING',
      });
    } else if (createDepositDto.exchange) {
    }

    await this.usersService.updateBalance(userId, -createDepositDto.amount);

    return await this.depositsRepository
      .save(deposit)
      .then(() => this.getOne(deposit.id));
  }

  async getAllDepositOfUser(userId: string) {
    return await this.depositsRepository.find({
      where: { user: { id: userId } },
    });
  }

  async getAllDepositOfAnAuction(auctionId: string) {
    return await this.depositsRepository.find({
      where: { auction: { id: auctionId } },
    });
  }

  async getAllDepositOfAnExchange(exchangeId: string) {
    return await this.depositsRepository.find({
      where: { exchange: { id: exchangeId } },
    });
  }

  async refundDepositToAUser(depositId: string) {
    const deposit = await this.getOne(depositId);
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    await this.usersService.updateBalance(deposit.user.id, deposit.amount);

    return await this.depositsRepository
      .update(depositId, {
        status: 'REFUNDED',
      })
      .then(() => this.getOne(depositId));
  }

  async refundAllDepositsOfAnAuction(auctionId: string) {
    const auction = await this.auctionsService.findAuctionById(auctionId);
    if (!auction) throw new NotFoundException('Auction cannot be found!');

    const depositList = await this.depositsRepository.find({
      where: { auction: { id: auctionId } },
    });

    return await Promise.all(
      depositList.map(async (deposit) => {
        await this.refundDepositToAUser(deposit.id);
      }),
    )
      .catch((err) => console.log(err))
      .finally(() => {
        return {
          message: `Deposits of the auction are successfully refunded to ${depositList.length} user(s).`,
        };
      });
  }

  async refundAllDepositsOfAnExchange(exchangeId: string) {
    const exchange = await this.exchangesService.getOne(exchangeId);
    if (!exchange) throw new NotFoundException('Exchange cannot be found!');

    const depositList = await this.depositsRepository.find({
      where: { exchange: { id: exchangeId } },
    });

    return await Promise.all(
      depositList.map(async (deposit) => {
        await this.refundDepositToAUser(deposit.id);
      }),
    )
      .catch((err) => console.log(err))
      .finally(() => {
        return {
          message: `Deposits of the exchange are successfully refunded to ${depositList.length} user(s).`,
        };
      });
  }

  async seizeADeposit(depositId: string) {
    const deposit = await this.getOne(depositId);
    if (!deposit) throw new NotFoundException('Deposit cannot be found!');

    return await this.depositsRepository
      .update(depositId, {
        status: 'SEIZED',
      })
      .then(() => this.getOne(depositId));
  }
}