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
import { ConditionsService } from './conditions.service';
import { CreateConditionDTO, UpdateConditionDTO } from './dto/condition.dto';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Condition')
@Controller('conditions')
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Get()
  getAllConditions() {
    return this.conditionsService.getAllConditions();
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  createNewCondition(@Body() dto: CreateConditionDTO) {
    return this.conditionsService.createNewCondition(dto);
  }

  @Get(':value')
  getConditionByValue(@Param('value') value: string) {
    return this.conditionsService.getConditionByValue(Number(value));
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Patch(':value')
  updateCondition(
    @Param('value') value: string,
    @Body() dto: UpdateConditionDTO,
  ) {
    return this.conditionsService.updateCondition(Number(value), dto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':value')
  deleteCondition(@Param('value') value: string) {
    return this.conditionsService.deleteCondition(Number(value));
  }
}
