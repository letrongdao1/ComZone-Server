import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { ApiBearerAuth, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { RoleDTO } from './dto/roleDTO';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllRoles() {
    return this.rolesService.getAll();
  }

  @ApiExcludeEndpoint()
  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewRole(@Body() roleDTO: RoleDTO) {
    return this.rolesService.create(roleDTO);
  }
}
