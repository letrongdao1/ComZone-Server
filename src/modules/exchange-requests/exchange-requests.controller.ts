import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExchangeRequestsService } from './exchange-requests.service';
import {
  CreateExchangePostDTO,
  UpdateExchangeSettingsDTO,
} from './dto/exchange-request.dto';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../authorization/roles.decorator';
import { Role } from '../authorization/role.enum';
import { PermissionsGuard } from '../authorization/permission.guard';
import { ExchangeRequestStatusEnum } from './dto/exchange-request-status.enum';

@ApiBearerAuth()
@ApiTags('Exchange requests')
@Controller('exchange-requests')
export class ExchangeRequestsController {
  constructor(
    private readonly exchangeRequestsService: ExchangeRequestsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createExchangePost(
    @Req() req: any,
    @Body() createExchangePostDto: CreateExchangePostDTO,
  ) {
    return this.exchangeRequestsService.createExchangePost(
      req.user.id,
      createExchangePostDto,
    );
  }

  @Get('available')
  getAvailableExchangePostsAsGuest() {
    // return this.exchangeRequestsService.getAvailableExchangePosts();
  }

  @Get('search')
  getSearchedExchangesAsGuest(@Query('key') key: string) {
    // return this.exchangeRequestsService.getSearchedExchanges(key);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllExchangePostsOfUser(@Req() req: any) {
    return this.exchangeRequestsService.getAllExchangePostsOfUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('exchange-settings/:id')
  updateExchangeSettings(
    @Param('id') id: string,
    @Body() dto: UpdateExchangeSettingsDTO,
  ) {
    return this.exchangeRequestsService.updateExchangeSettings(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/successful/:id')
  completeAsSuccessful(@Req() req: any, @Param('id') requestId: string) {
    return this.exchangeRequestsService.completeExchangeRequest(
      req.user.id,
      requestId,
      ExchangeRequestStatusEnum.SUCCESSFUL,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('status/failed/:id')
  completeAsFailed(@Req() req: any, @Param('id') requestId: string) {
    return this.exchangeRequestsService.completeExchangeRequest(
      req.user.id,
      requestId,
      ExchangeRequestStatusEnum.FAILED,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('soft/:id')
  softDeleteExchangePost(@Req() req: any, @Param('id') exchangeId: string) {
    return this.exchangeRequestsService.softDeleteExchangePost(
      req.user.id,
      exchangeId,
    );
  }

  @Delete('undo/:id')
  undoDelete(@Param('id') exchangeId: string) {
    return this.exchangeRequestsService.undoDelete(exchangeId);
  }

  @Roles(Role.MODERATOR)
  @UseGuards(PermissionsGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') exchangeId: string) {
    return this.exchangeRequestsService.remove(exchangeId);
  }
}
