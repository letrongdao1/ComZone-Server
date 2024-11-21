import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { DeliveryInformationService } from './delivery-information.service';
import { CreateDeliveryInformationDTO } from './dto/create-delivery-information.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';

@ApiBearerAuth()
@ApiTags('Delivery Information')
@Controller('delivery-information')
export class DeliveryInformationController {
  constructor(
    private readonly deliveryInformationService: DeliveryInformationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewDeliveryInformation(
    @Req() req: any,
    @Body() createDeliveryInformationDto: CreateDeliveryInformationDTO,
  ) {
    return this.deliveryInformationService.createNewDeliveryInfo(
      req.user.id,
      createDeliveryInformationDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getByUserId(@Req() req: any) {
    return this.deliveryInformationService.getByUserId(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryInformationService.getOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryInformationService.softDelete(id);
  }
}
