import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuctionCriteria } from 'src/entities/auction-criteria.entity';
import { Repository } from 'typeorm';
import { UpdateAuctionCriteriaDTO } from './dto/update-criteria.dto';
import { EditionsService } from '../editions/editions.service';
import { ConditionsService } from '../conditions/conditions.service';

@Injectable()
export class AuctionCriteriaService {
  constructor(
    @InjectRepository(AuctionCriteria)
    private readonly auctionCriteriaRepository: Repository<AuctionCriteria>,

    private readonly conditionsService: ConditionsService,
    private readonly editionsService: EditionsService,
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
        conditionLevel: await this.conditionsService.getConditionByValue(4),
        editionRestricted: false,
      }))
    );
  }

  async updateAuctionCriteria(dto: UpdateAuctionCriteriaDTO) {
    if (dto.disallowedEdition && dto.disallowedEdition.length > 0)
      await Promise.all(
        dto.disallowedEdition.map(async (id) => {
          await this.editionsService.disableEditionFromAuction(id);
        }),
      );

    return await this.auctionCriteriaRepository.update(
      { id: 1 },
      {
        isFullInfoFilled: dto.isFullInfoFilled,
        conditionLevel: await this.conditionsService.getConditionByValue(
          dto.conditionLevel,
        ),
        editionRestricted:
          dto.disallowedEdition && dto.disallowedEdition.length > 0,
      },
    );
  }
}
