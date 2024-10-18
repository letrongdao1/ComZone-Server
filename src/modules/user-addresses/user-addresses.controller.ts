import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserAddressDTO } from './dto/user-address';

@ApiBearerAuth()
@ApiTags('User addresses')
@Controller('user-addresses')
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createNewAddress(@Req() req: any, @Body() addressDto: UserAddressDTO) {
    return this.userAddressesService.createNewAddress(req.user.id, addressDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getAllAddressesOfUser(@Req() req: any) {
    return this.userAddressesService.getAllAddressesOfUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('address-code/:addressId')
  getAddressCodesOfUser(@Param('addressId') addressId: string) {
    return this.userAddressesService.getAddressCodesOfUser(addressId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('default/:addressId')
  updateDefaultAddress(@Req() req: any, @Param('addressId') addressId: string) {
    return this.userAddressesService.updateDefaultAddress(
      req.user.id,
      addressId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('used-time/:addressId')
  incrementAddressUsedTime(@Param('addressId') addressId: string) {
    return this.userAddressesService.incrementAddressUsedTime(addressId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':addressId')
  updateAddress(
    @Param('addressId') addressId: string,
    @Body() addressDto: UserAddressDTO,
    @Req() req: any,
  ) {
    return this.userAddressesService.updateAddress(
      req.user.id,
      addressId,
      addressDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':addressId')
  deleteUserAddress(@Req() req: any, @Param('addressId') addressId: string) {
    return this.userAddressesService.deleteAddress(req.user.id, addressId);
  }
}
