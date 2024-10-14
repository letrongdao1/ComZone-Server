import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiTags('Users')
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
  findUserByEmail(@Param('email') email: string) {
    return this.usersService.findAccountByEmail(email);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch('role/:id')
  updateRoleToSeller(@Param('id') userId: string) {
    return this.usersService.updateRoleToSeller(userId);
  }
}
