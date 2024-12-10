import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Order } from 'src/entities/orders.entity';
import { User } from 'src/entities/users.entity';
import { WalletDeposit } from 'src/entities/wallet-deposit.entity';
import { Repository } from 'typeorm';
import { UserProfileDTO } from './dto/user-profile.dto';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WalletDeposit)
    private readonly walletDepositsRepository: Repository<WalletDeposit>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {
    super(userRepository);
  }

  async createMemberAccount(user: any): Promise<User> {
    const newUser = {
      ...user,
      role: 'MEMBER',
    };
    return await this.userRepository.save(newUser);
  }

  async getOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'name',
        'phone',
        'avatar',
        'role',
        'isActive',
        'balance',
        'nonWithdrawableAmount',
        'createdAt',
        'updatedAt',
        'refresh_token',
      ],
    });

    user.balance -= user.nonWithdrawableAmount;

    return user;
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async getUserRole(id: string) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['role'],
    });
  }

  async updateRefreshToken(id: string, hashedRefreshToken: string) {
    return await this.userRepository.update(id, {
      refresh_token: hashedRefreshToken,
    });
  }

  async updateRoleToSeller(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('User cannot be found!');

    switch (user.role) {
      case 'MEMBER': {
        await this.userRepository.update(userId, {
          role: 'SELLER',
        });

        return await this.userRepository.findOne({ where: { id: userId } });
      }
      case 'SELLER': {
        return {
          error: 'Unnecessary request!',
          message: 'This has already been a seller account!',
        };
      }
      default: {
        throw new ForbiddenException("This account's role cannot be updated!");
      }
    }
  }

  async updateLastActive(userId: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });
    if (!user) throw new NotFoundException('User cannot be found!');

    await this.userRepository.update(userId, {
      last_active: new Date().toLocaleString(),
    });
  }

  async depositWallet(walletDepositId: string) {
    const walletDeposit = await this.walletDepositsRepository.findOne({
      where: { id: walletDepositId },
    });

    const user = await this.getOne(walletDeposit.user.id);

    if (walletDeposit.amount <= 0 || walletDeposit.amount > 999999999)
      throw new BadRequestException('Invalid amount!');

    if (walletDeposit.status !== 'SUCCESSFUL')
      throw new ForbiddenException(
        'Wallet deposit transaction is not completed yet!',
      );

    return await this.userRepository
      .update(user.id, { balance: user.balance + walletDeposit.amount })
      .then(() => this.getOne(user.id));
  }

  async userWalletOrderPay(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    const user = await this.getOne(order.user.id);

    if (user.balance - user.nonWithdrawableAmount < order.totalPrice)
      throw new ForbiddenException('Insufficient balance!');

    await this.userRepository.update(user.id, {
      balance: user.balance - order.totalPrice,
    });

    return await this.ordersRepository
      .update(orderId, { isPaid: true })
      .then(() => this.getOne(user.id));
  }

  async updateBalance(userId: string, amount: number) {
    const user = await this.getOne(userId);

    return await this.userRepository
      .update(userId, {
        balance: user.balance + amount,
      })
      .then(() => this.getOne(userId));
  }

  async updateBalanceWithNonWithdrawableAmount(userId: string, amount: number) {
    const user = await this.getOne(userId);

    return await this.userRepository
      .update(userId, {
        balance: user.balance + amount,
        nonWithdrawableAmount: user.nonWithdrawableAmount + amount,
      })
      .then(() => this.getOne(userId));
  }

  async updateNWBalanceAfterOrder(userId: string, amount: number) {
    const user = await this.getOne(userId);

    return await this.userRepository
      .update(userId, {
        nonWithdrawableAmount: user.nonWithdrawableAmount - amount,
      })
      .then(() => this.getOne(userId));
  }

  async updateUserIsActive(userId: string, active: boolean) {
    console.log(`User ${userId} is ${active ? 'now ONLINE' : 'OFFLINE'}!`);
    if (active === false) this.updateLastActive(userId);
    return await this.userRepository.update(userId, { isActive: active });
  }

  async updateUserProfile(userId: string, dto: UserProfileDTO) {
    const user = await this.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    return await this.userRepository
      .update(userId, {
        name: dto.name || user.name,
        phone: dto.phone || user.phone,
        avatar: dto.avatar || user.avatar,
      })
      .then(() => this.getOne(userId));
  }

  async updatePassword(userId: string, password: string) {
    return await this.userRepository.update(userId, { password });
  }
  async banUser(userId: string) {
    const user = await this.getOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = 'banned';
    await this.userRepository.save(user);

    return { message: 'User banned successfully', userId };
  }
}
