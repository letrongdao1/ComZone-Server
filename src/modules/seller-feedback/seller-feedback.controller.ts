import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { SellerFeedbackService } from './seller-feedback.service';
import {
  CreateSellerFeedbackDto,
  UpdateSellerFeedbackDto,
} from './dto/seller-feedback.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('seller-feedback')
@Controller('seller-feedback')
export class SellerFeedbackController {
  constructor(private readonly sellerFeedbackService: SellerFeedbackService) {}

  @Post()
  create(@Body() createSellerFeedbackDto: CreateSellerFeedbackDto) {
    return this.sellerFeedbackService.createFeedback(createSellerFeedbackDto);
  }

  @Get()
  findAll() {
    return this.sellerFeedbackService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sellerFeedbackService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSellerFeedbackDto: UpdateSellerFeedbackDto,
  ) {
    return this.sellerFeedbackService.updateFeedback(
      id,
      updateSellerFeedbackDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sellerFeedbackService.removeFeedback(id);
  }
}
