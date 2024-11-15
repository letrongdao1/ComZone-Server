import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import {
  OrderPayTransactionDTO,
  WalletDepositTransactionDTO,
} from './dto/wallet-transaction.dto';
import { UserProfileDTO } from './dto/user-profile.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.MODERATOR, Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllUsers() {
    return this.usersService.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUserProfile(@Req() req: any) {
    return this.usersService.getOne(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('email/:email')
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  getUserById(@Param(':userId') userId: string) {
    return this.usersService.getOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/wallet/deposit')
  depositUserWallet(
    @Body() walletDepositTransactionDto: WalletDepositTransactionDTO,
  ) {
    return this.usersService.depositWallet(
      walletDepositTransactionDto.walletDeposit,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/wallet/pay')
  userWalletOrderPay(@Body() orderPayTransactionDto: OrderPayTransactionDTO) {
    return this.usersService.userWalletOrderPay(orderPayTransactionDto.order);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/profile')
  updateUserProfile(@Req() req: any, @Body() userProfileDTO: UserProfileDTO) {
    return this.usersService.updateUserProfile(req.user.id, userProfileDTO);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('active-status/online')
  updateUserActiveStatusOnline(@Req() req: any) {
    return this.usersService.updateUserIsActive(req.user.id, true);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('active-status/offline')
  updateUserActiveStatusOffline(@Req() req: any) {
    return this.usersService.updateUserIsActive(req.user.id, false);
  }

  @Patch(':id/ban')
  @UseGuards(JwtAuthGuard)
  async banUser(@Param('id') userId: string) {
    return this.usersService.banUser(userId);
  }
}
