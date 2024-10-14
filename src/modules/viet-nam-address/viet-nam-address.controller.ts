import { Controller } from '@nestjs/common';
import { VietNamAddressService } from './viet-nam-address.service';

@Controller('viet-nam-address')
export class VietNamAddressController {
  constructor(private readonly vietNamAddressService: VietNamAddressService) {}
}
