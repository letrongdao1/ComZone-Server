import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Edition } from 'src/entities/edition.entity';
import { Repository } from 'typeorm';
import { CreateEditionDTO, EditEditionDTO } from './dto/edition.dto';

@Injectable()
export class EditionsService extends BaseService<Edition> {
  constructor(
    @InjectRepository(Edition)
    private readonly editionsRepository: Repository<Edition>,
  ) {
    super(editionsRepository);
  }

  private readonly defaultEditions = [
    {
      name: 'Bản tiêu chuẩn',
      description:
        'Phiên bản cơ bản với chất lượng in ấn tiêu chuẩn và đầy đủ nội dung, phù hợp cho những ai yêu thích sự tiện lợi và giá cả phải chăng.',
    },
    {
      name: 'Bản đặc biệt',
      description:
        'Phiên bản cao cấp với thiết kế bìa đặc biệt, các trang bổ sung, và quà tặng độc đáo, mang đến trải nghiệm đọc đặc biệt cho người hâm mộ.',
    },
    {
      name: 'Bản giới hạn',
      description:
        'Phiên bản giới hạn, sản xuất số lượng ít, kèm theo các ưu đãi đặc biệt và quà tặng quý giá, dành cho những người sưu tập và yêu thích sự độc đáo.',
    },
  ];

  async createNewEdition(dto: CreateEditionDTO) {
    return this.editionsRepository.save(dto);
  }

  async getAllEditions() {
    const editions = await this.editionsRepository.find();

    if (editions.length > 0) return editions;

    await Promise.all(
      this.defaultEditions.map(async (edition) => {
        await this.createNewEdition(edition);
      }),
    );

    return await this.getAllEditions();
  }

  async editEdition(id: string, dto: EditEditionDTO) {
    return this.editionsRepository.update(id, dto).then(() => this.getOne(id));
  }
}
