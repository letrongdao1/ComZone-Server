import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

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
  @Patch('/role/seller')
  updateRoleToSeller(@Req() req: any) {
    return this.usersService.updateRoleToSeller(req.user.id);
  }
}
