import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryInformationDto } from './create-delivery-information.dto';

export class UpdateDeliveryInformationDto extends PartialType(CreateDeliveryInformationDto) {}
