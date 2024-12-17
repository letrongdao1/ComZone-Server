import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StatusQueryEnum } from './dto/status-query.enum';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';

@ApiBearerAuth()
@ApiTags('Exchanges')
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Get('all')
  getAllExchanges() {
    return this.exchangesService.getAllWithDeleted();
  }

  @ApiQuery({ name: 'status', type: 'enum', enum: StatusQueryEnum })
  @UseGuards(JwtAuthGuard)
  @Get('user/status')
  getUserRequestByStatus(
    @Req() req: any,
    @Query('status') status: StatusQueryEnum,
  ) {
    return this.exchangesService.getByStatusQuery(req.user.id, status);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.exchangesService.getOne(id);
  }

  @ApiBody({
    schema: {
      properties: {
        packagingImages: {
          type: 'array',
          nullable: true,
          example: ['images.jpg'],
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch('accept/:id')
  acceptExchangeRequest(@Req() req: any, @Param('id') id: string) {
    return this.exchangesService.updateExchangeToDealing(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('reject/:id')
  rejectExchangeRequest(@Req() req: any, @Param('id') id: string) {
    return this.exchangesService.rejectExchangeRequest(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('pay/:exchange_id')
  payExchangeAmount(@Req() req: any, @Param('exchange_id') id: string) {
    return this.exchangesService.payExchangeAmount(req.user.id, id);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete('permanent/:id')
  deleteExchange(@Param('id') id: string) {
    return this.exchangesService.deleteExchange(id);
  }
}
