import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Address } from 'src/entities/address.entity';
import { Not, Repository } from 'typeorm';
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

    if (userAddresses.length === 3)
      throw new ForbiddenException(
        'This user reached the maximum of 3 addresses!',
      );

    if (addressDto.isDefault) {
      await this.userAddressesRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    const newAddress = this.userAddressesRepository.create({
      ...addressDto,
      user,
      isDefault: addressDto.isDefault || userAddresses.length === 0,
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

  async updateAddress(
    userId: string,
    addressId: string,
    addressDto: UserAddressDTO,
  ) {
    if (addressDto.isDefault) {
      await this.userAddressesRepository.update(
        { user: { id: userId } },
        { isDefault: false },
      );
    }

    return await this.userAddressesRepository.update(addressId, {
      ...addressDto,
    });
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

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.userAddressesRepository.findOne({
      where: { id: addressId },
    });

    const userAddresses = await this.userAddressesRepository.find({
      where: { user: { id: userId } },
      order: { usedTime: 'DESC' },
    });

    if (userAddresses.length > 1) {
      if (address.isDefault) {
        const filteredList = userAddresses.filter(
          (address) => address.id !== addressId,
        );

        if (filteredList.length === 2) {
          var newSelectedDefaultAddress: Address = null;
          if (filteredList[0].usedTime === filteredList[1].usedTime) {
            newSelectedDefaultAddress = filteredList.reduce((prev, current) => {
              return prev &&
                new Date(prev.createdAt) < new Date(current.createdAt)
                ? prev
                : current;
            });
          } else {
            newSelectedDefaultAddress = filteredList.reduce((prev, current) => {
              return prev && prev.usedTime > current.usedTime ? prev : current;
            });
          }
          if (newSelectedDefaultAddress)
            await this.userAddressesRepository.update(
              { id: newSelectedDefaultAddress.id },
              { isDefault: true },
            );
        } else {
          await this.userAddressesRepository.update(
            { id: Not(addressId) },
            { isDefault: true },
          );
        }
      }
    }

    return await this.userAddressesRepository.delete(addressId);
  }
}
