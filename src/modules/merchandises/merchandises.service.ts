import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/service.base';
import { Merchandise } from 'src/entities/merchandise.entity';
import { Repository } from 'typeorm';
import {
  CreateMerchandiseDTO,
  EditMerchandiseDTO,
} from './dto/merchandise.dto';

@Injectable()
export class MerchandisesService extends BaseService<Merchandise> {
  constructor(
    @InjectRepository(Merchandise)
    private readonly merchandisesRepository: Repository<Merchandise>,
  ) {
    super(merchandisesRepository);
  }

  private readonly defaultMerchandises = [
    {
      name: 'Poster',
      description:
        'Tranh hoặc hình in lớn, thường là bìa hoặc minh họa từ truyện. Có thể dùng để trang trí tường, kích thước đa dạng, mang đậm phong cách bộ truyện.',
      caution: 'Có thể cuốn gọn',
    },
    {
      name: 'Sticker',
      subName: 'Sticker',
      description:
        'Miếng dán nhiều kiểu dáng, thường là hình nhân vật hoặc logo bộ truyện. Có thể dán trên sổ tay, laptop, hoặc sưu tầm làm kỷ niệm.',
    },
    {
      name: 'Đánh dấu trang',
      subName: 'Bookmark',
      description:
        'Phụ kiện nhỏ gọn, in hình nhân vật hoặc biểu tượng đặc trưng của truyện. Thường làm từ giấy cứng, nhựa hoặc kim loại, giúp người đọc đánh dấu trang dễ dàng.',
    },
    {
      name: 'Mô hình nhân vật',
      subName: 'Figure',
      description:
        'Mô hình thu nhỏ của nhân vật, làm từ nhựa hoặc resin. Đây là sản phẩm cao cấp, tái hiện chi tiết các nhân vật yêu thích.',
      caution: 'Nặng không quá 5kg, cao tối đa 50cm',
    },
    {
      name: 'Huy hiệu',
      subName: 'Badge/Pin',
      description:
        'Huy hiệu nhỏ gọn, có thể cài lên áo, túi hoặc mũ. Thường in hình nhân vật, biểu tượng hoặc logo của bộ truyện.',
    },
    {
      name: 'Card minh họa',
      subName: 'Art Card',
      description:
        'Thẻ in hình minh họa nhân vật hoặc cảnh nổi bật. Kích thước tương đương bưu thiếp, phù hợp cho sưu tầm hoặc trưng bày.',
    },
    {
      name: 'Sổ tay',
      description:
        'Sổ tay hoặc nhật ký thiết kế theo phong cách truyện. Sản phẩm không chỉ để viết mà còn là món đồ trang trí độc đáo.',
    },
    {
      name: 'Gối, móc khóa',
      description:
        'Gối in hình nhân vật đáng yêu và móc khóa nhiều kiểu dáng. Những phụ kiện này thường được fan yêu thích để trang trí hoặc sử dụng hàng ngày.',
    },
    {
      name: 'Áo thun, túi vải',
      description:
        'Trang phục hoặc phụ kiện tiện dụng in hình truyện. Thiết kế đẹp mắt, phù hợp cho cả fan hâm mộ và thời trang thường ngày.',
    },
    {
      name: 'Hộp đựng',
      description:
        'Hộp thiết kế đặc biệt để bảo quản bộ truyện. Thường có hình in độc quyền, là sản phẩm lý tưởng cho người sưu tầm.',
    },
    {
      name: 'Đĩa CD/DVD',
      description:
        'Đĩa âm nhạc hoặc video, bao gồm nhạc nền, PV hoặc phiên bản hoạt hình của bộ truyện. Là sản phẩm giá trị cho người hâm mộ.',
    },
    {
      name: 'Đế lót ly',
      description:
        'Phụ kiện trang trí bàn ăn hoặc bàn làm việc. Đế lót ly thường in hình nhân vật hoặc biểu tượng từ bộ truyện yêu thích.',
    },
  ];

  async createNewMerchandise(dto: CreateMerchandiseDTO) {
    return this.merchandisesRepository.save(dto);
  }

  async getAllMerchandises() {
    const merchandises = await this.merchandisesRepository.find();

    if (merchandises.length > 0) return merchandises;

    await Promise.all(
      this.defaultMerchandises.map(async (merch) => {
        await this.createNewMerchandise(merch);
      }),
    );

    return await this.getAllMerchandises();
  }

  async editMerchandise(id: string, dto: EditMerchandiseDTO) {
    return this.merchandisesRepository
      .update(id, dto)
      .then(() => this.getOne(id));
  }
}
