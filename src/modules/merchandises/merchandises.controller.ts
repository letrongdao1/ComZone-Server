import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MerchandisesService } from './merchandises.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Role } from '../authorization/role.enum';
import {
  CreateMerchandiseDTO,
  EditMerchandiseDTO,
} from './dto/merchandise.dto';

@ApiBearerAuth()
@ApiTags('Merchandise')
@Controller('merchandises')
export class MerchandisesController {
  constructor(private readonly merchandisesService: MerchandisesService) {}

  @Get()
  getAllMerchandises() {
    return this.merchandisesService.getAllMerchandises();
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewEdition(@Body() dto: CreateMerchandiseDTO) {
    return this.merchandisesService.createNewMerchandise(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  editEdition(@Param('id') id: string, @Body() dto: EditMerchandiseDTO) {
    return this.merchandisesService.editMerchandise(id, dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteEdition(@Param('id') id: string) {
    return this.merchandisesService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('restore/:id')
  undoDeleteMerchandise(@Param('id') id: string) {
    return this.merchandisesService.restore(id);
  }
}
