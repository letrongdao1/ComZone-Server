import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { WalletDepositDTO } from './dto/wallet-deposit.dto';
import { BaseService } from 'src/common/service.base';
import { Transaction } from 'src/entities/transactions.entity';
import { PaymentGatewayEnum } from './dto/provider.enum';
import { WalletDepositStatusEnum } from './dto/status.enum';

@Injectable()
export class WalletDepositService extends BaseService<WalletDeposit> {
  constructor(
    @InjectRepository(WalletDeposit)
    private readonly walletDepositRepository: Repository<WalletDeposit>,
    @Inject() private readonly usersService: UsersService,
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
  ) {
    super(walletDepositRepository);
  }

  async createWalletDeposit(
    userId: string,
    walletDepositDto: WalletDepositDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const { amount } = walletDepositDto;
    if (amount <= 0 || amount > 999999999)
      throw new BadRequestException('Invalid amount!');

    const walletDeposit = this.walletDepositRepository.create({
      user,
      amount,
      status: 'PENDING',
    });

    return await this.walletDepositRepository.save(walletDeposit);
  }

  async getWalletDepositsByUser(userId: string) {
    return await this.walletDepositRepository.find({
      where: { user: { id: userId } },
    });
  }

  async updateProvider(
    walletDepositId: string,
    paymentGateway: PaymentGatewayEnum,
  ) {
    return await this.walletDepositRepository
      .update(walletDepositId, {
        paymentGateway,
      })
      .then(() => this.getOne(walletDepositId));
  }

  async updateWalletDepositStatus(
    walletDepositId: string,
    status: WalletDepositStatusEnum,
  ) {
    await this.walletDepositRepository.update(walletDepositId, {
      status,
    });

    return await this.getOne(walletDepositId);
  }
}
