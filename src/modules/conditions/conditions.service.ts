import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Condition } from 'src/entities/condition.entity';
import { Repository } from 'typeorm';
import { CreateConditionDTO, UpdateConditionDTO } from './dto/condition.dto';

@Injectable()
export class ConditionsService {
  constructor(
    @InjectRepository(Condition)
    private readonly conditionsRepository: Repository<Condition>,
  ) {}

  async createNewCondition(dto: CreateConditionDTO) {
    const checkConditionByValue = await this.conditionsRepository.findOne({
      where: { value: dto.value },
    });
    if (checkConditionByValue)
      throw new ConflictException(
        `The condition value "${dto.value}" has been initialized!`,
        'Conflict condition value',
      );

    const checkConditionByName = await this.conditionsRepository.findOne({
      where: { name: dto.name },
    });
    if (checkConditionByName)
      throw new ConflictException(
        `The condition name "${dto.name}" has been initialized!`,
        'Conflict condition name',
      );

    return await this.conditionsRepository.save(dto);
  }

  private readonly defaultConditions = [
    {
      value: 10,
      name: 'Hoàn hảo',
      usageLevel: 'Không sử dụng',
      description:
        'Tình trạng hoàn hảo với bìa sáng bóng, không xước, mép và góc sắc nét, giấy trắng hoặc hơi ngà không có dấu hiệu ố vàng.',
      isRemarkable: true,
    },
    {
      value: 9,
      name: 'Gần như hoàn hảo',
      usageLevel: 'Ít sử dụng',
      description:
        'Tình trạng gần như hoàn hảo với một vài dấu hiệu sử dụng như mép giấy hoặc góc hơi quăn nhẹ.',
      isRemarkable: false,
    },
    {
      value: 8,
      name: 'Rất tốt',
      usageLevel: 'Sử dụng cẩn thận',
      description:
        'Tình trạng rất tốt với vài lỗi nhỏ như mép bìa hơi mòn hoặc giấy hơi ngả màu, nhưng vẫn giữ được thẩm mỹ tổng thể.',
      isRemarkable: true,
    },
    {
      value: 6,
      name: 'Tốt',
      usageLevel: 'Sử dụng vừa phải',
      description:
        'Tình trạng tốt với dấu hiệu sử dụng rõ ràng như vết gấp nhẹ trên bìa hoặc góc và giấy ngả màu nhiều hơn.',
      isRemarkable: false,
    },
    {
      value: 5,
      name: 'Trung bình khá',
      usageLevel: 'Sử dụng đáng kể',
      description:
        'Tình trạng trung bình khá với mép mòn, vết nhăn hoặc giấy hơi dính nhưng nội dung vẫn nguyên vẹn và rõ ràng.',
      isRemarkable: true,
    },
    {
      value: 4,
      name: 'Trung bình',
      usageLevel: 'Sử dụng nhiều',
      description:
        'Tình trạng trung bình với dấu hiệu sử dụng như rách nhỏ, nếp gấp rõ, giấy ố vàng hoặc bìa mất độ sáng.',
      isRemarkable: false,
    },
    {
      value: 2,
      name: 'Kém',
      usageLevel: 'Sử dụng rất nhiều',
      description:
        'Tình trạng kém với bìa rách, gáy lỏng lẻo, vài trang nhăn hoặc mất góc và có thể có vết bút hay vẽ.',
      isRemarkable: true,
    },
    {
      value: 1,
      name: 'Rất kém',
      usageLevel: 'Hư hỏng nặng',
      description:
        'Tình trạng rất kém với hư hỏng nghiêm trọng như thiếu trang hoặc bìa bị tách rời nhưng nội dung vẫn đọc được.',
      isRemarkable: false,
    },
    {
      value: 0,
      name: 'Tệ',
      usageLevel: 'Hư hỏng hoàn toàn',
      description:
        'Tình trạng rất tệ với bìa và trang mất một phần lớn, giấy rách nát hoặc mòn chỉ còn giá trị lưu giữ kỷ niệm.',
      isRemarkable: true,
    },
  ];

  async getAllConditions() {
    const conditions = await this.conditionsRepository.find({
      order: { value: 'ASC' },
    });
    if (conditions && conditions.length > 0) return conditions;

    await Promise.all(
      this.defaultConditions.map(
        async (condition) => await this.createNewCondition(condition),
      ),
    );

    return this.getAllConditions();
  }

  async getConditionByValue(value: number) {
    return await this.conditionsRepository.findOneBy({ value });
  }

  async updateCondition(value: number, dto: UpdateConditionDTO) {
    return await this.conditionsRepository
      .update(value, dto)
      .then(() => this.getConditionByValue(value));
  }

  async deleteCondition(value: number) {
    return await this.conditionsRepository.remove(
      await this.getConditionByValue(value),
    );
  }
}
