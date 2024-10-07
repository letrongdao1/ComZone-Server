import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PermissionDTO } from './dto/permissionDTO';

@ApiTags('Permission')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  getAllPermissions() {
    return this.permissionsService.getAll();
  }

  @Post()
  createNewPermission(@Body() permissionDTO: PermissionDTO) {
    return this.permissionsService.createNewPermission(
      permissionDTO.permission_description,
      permissionDTO.roles,
    );
  }
}
