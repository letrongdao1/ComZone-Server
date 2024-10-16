import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Address } from 'src/entities/address.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { UserAddressDTO } from './dto/user-address';

@Injectable()
export class UserAddressesService extends BaseService<Address> {
  constructor(
    @InjectRepository(Address)
    private readonly userAddressesRepository: Repository<Address>,
    private readonly usersService: UsersService,
  ) {
    super(userAddressesRepository);
  }

  async createNewAddress(userId: string, addressDto: UserAddressDTO) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const checkAddress = await this.userAddressesRepository.findOne({
      where: {
        ...addressDto,
        user: {
          id: userId,
        },
      },
    });

    if (checkAddress)
      throw new ConflictException('This address has already been added!');

    const userAddresses = await this.userAddressesRepository.find({
      where: { user: { id: userId } },
    });

    const newAddress = this.userAddressesRepository.create({
      ...addressDto,
      user,
      isDefault: userAddresses.length === 0,
      usedTime: 0,
    });

    return await this.userAddressesRepository.save(newAddress);
  }

  async getAllAddressesOfUser(userId: string) {
    return await this.userAddressesRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: {
        isDefault: 'DESC',
        usedTime: 'DESC',
      },
    });
  }

  async updateDefaultAddress(userId: string, addressId: string) {
    const checkAddress = await this.userAddressesRepository.findOne({
      where: {
        id: addressId,
      },
    });

    if (!checkAddress)
      throw new NotFoundException('User address cannot be found!');

    if (checkAddress.isDefault)
      return {
        message: 'This address has already been default!',
      };

    await this.userAddressesRepository.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    return await this.userAddressesRepository.update(
      { id: addressId },
      { isDefault: true },
    );
  }

  async incrementAddressUsedTime(addressId: string) {
    const address = await this.userAddressesRepository.findOne({
      where: { id: addressId },
    });

    if (!address) throw new NotFoundException('Address cannot be found!');

    return await this.userAddressesRepository.update(addressId, {
      usedTime: address.usedTime + 1,
    });
  }
}
