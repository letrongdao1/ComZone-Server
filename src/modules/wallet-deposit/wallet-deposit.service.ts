import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { WalletDepositDTO } from './dto/wallet-deposit.dto';
import { BaseService } from 'src/common/service.base';
import { PaymentGatewayEnum } from './dto/provider.enum';
import { WalletDepositStatusEnum } from './dto/status.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatusEnum } from '../transactions/dto/transaction-status.enum';
import { EventsGateway } from '../socket/event.gateway';
import CurrencySplitter from 'src/utils/currency-spliter/CurrencySplitter';
import {
  AnnouncementType,
  RecipientType,
} from 'src/entities/announcement.entity';

@Injectable()
export class WalletDepositService extends BaseService<WalletDeposit> {
  constructor(
    @InjectRepository(WalletDeposit)
    private readonly walletDepositRepository: Repository<WalletDeposit>,

    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService,
    private readonly eventsGateway: EventsGateway,
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
    const walletDeposit = await this.walletDepositRepository.findOneBy({
      id: walletDepositId,
    });

    await this.walletDepositRepository.update(walletDepositId, {
      status,
    });

    if (status === WalletDepositStatusEnum.SUCCESSFUL) {
      await this.usersService.updateBalance(
        walletDeposit.user.id,
        walletDeposit.amount,
      );

      const transaction =
        await this.transactionsService.createWalletDepositTransaction(
          walletDeposit.user.id,
          walletDeposit.id,
        );

      await this.eventsGateway.notifyUser(
        walletDeposit.user.id,
        `Nạp thành công ${CurrencySplitter(walletDeposit.amount)}đ vào ví ComZone.`,
        { transactionId: transaction.id },
        'Nạp tiền thành công',
        AnnouncementType.TRANSACTION_ADD,
        RecipientType.USER,
      );
    } else {
      await this.transactionsService.createWalletDepositTransaction(
        walletDeposit.user.id,
        walletDeposit.id,
        TransactionStatusEnum.FAILED,
      );
    }

    return await this.getOne(walletDepositId);
  }
}
