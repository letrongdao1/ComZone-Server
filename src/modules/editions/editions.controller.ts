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
import { EditionsService } from './editions.service';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { CreateEditionDTO, EditEditionDTO } from './dto/edition.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Edition')
@Controller('editions')
export class EditionsController {
  constructor(private readonly editionsService: EditionsService) {}

  @Get()
  getAllEditions() {
    return this.editionsService.getAllEditions();
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewEdition(@Body() dto: CreateEditionDTO) {
    return this.editionsService.createNewEdition(dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  editEdition(@Param('id') id: string, @Body() dto: EditEditionDTO) {
    return this.editionsService.editEdition(id, dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteEdition(@Param('id') id: string) {
    return this.editionsService.softDelete(id);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('restore/:id')
  undoDeleteEdition(@Param('id') id: string) {
    return this.editionsService.restore(id);
  }
}
