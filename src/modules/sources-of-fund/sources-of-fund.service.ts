import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { SourceOfFund } from 'src/entities/source-of-fund.entity';
import { Repository } from 'typeorm';
import { SourceOfFundDTO } from './dto/source-of-fund.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class SourcesOfFundService extends BaseService<SourceOfFund> {
  constructor(
    @InjectRepository(SourceOfFund)
    private readonly sourcesOfFundRepository: Repository<SourceOfFund>,
    @Inject() private readonly usersService: UsersService,
  ) {
    super(sourcesOfFundRepository);
  }

  async createNewSourceOfFund(
    userId: string,
    sourceOfFundDto: SourceOfFundDTO,
  ) {
    const user = await this.usersService.getOne(userId);
    if (!user) throw new NotFoundException('User cannot be found!');

    const sourceOfFund = this.sourcesOfFundRepository.create({
      user,
      owner: sourceOfFundDto.owner,
      number: sourceOfFundDto.number,
      bankName: sourceOfFundDto.bankName,
      logo: sourceOfFundDto.logo,
    });

    return await this.sourcesOfFundRepository.save(sourceOfFund);
  }

  async getUserSourcesOfFund(userId: string) {
    return await this.sourcesOfFundRepository.find({
      where: { user: { id: userId } },
    });
  }
}
