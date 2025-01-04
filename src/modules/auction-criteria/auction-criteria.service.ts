import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionCriteria } from 'src/entities/auction-criteria.entity';
import { Repository } from 'typeorm';
import { UpdateAuctionCriteriaDTO } from './dto/update-criteria.dto';
import { EditionsService } from '../editions/editions.service';

@Injectable()
export class AuctionCriteriaService {
  constructor(
    @InjectRepository(AuctionCriteria)
    private readonly auctionCriteriaRepository: Repository<AuctionCriteria>,

    @Inject(EditionsService) private readonly editionsService: EditionsService,
  ) {}

  async getAuctionCriteriaDetails() {
    const criteria = await this.auctionCriteriaRepository.findOne({
      where: { id: 1 },
    });

    return (
      criteria ||
      (await this.auctionCriteriaRepository.save({
        id: 1,
        updatedAt: new Date(),
        isFullInfoFilled: false,
        conditionLevel: 4,
        disallowedEdition: [],
      }))
    );
  }

  async updateAuctionCriteria(dto: UpdateAuctionCriteriaDTO) {
    const editions = await Promise.all(
      dto.disallowedEdition.map(async (id) => {
        return await this.editionsService.getOne(id);
      }),
    );

    return await this.auctionCriteriaRepository.update(
      { id: 1 },
      {
        ...dto,
        disallowedEdition: editions,
      },
    );
  }
}
