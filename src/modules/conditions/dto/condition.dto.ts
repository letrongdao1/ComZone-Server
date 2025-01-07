import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateConditionDTO {
  @ApiProperty({ example: 5 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(0)
  @Max(10)
  value: number;

  @ApiProperty({ example: 'Trung bình khá' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Sử dụng đáng kể' })
  @IsOptional()
  @IsString()
  usageLevel?: string;

  @ApiProperty({
    example:
      'Tình trạng trung bình, có dấu hiệu sử dụng đáng kể, mép mòn, vết nhăn, hoặc giấy hơi dính. Nội dung vẫn nguyên vẹn và rõ ràng.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: true, default: false })
  @IsBoolean()
  isRemarkable: boolean;
}

export class UpdateConditionDTO {
  @ApiProperty({ example: 'Trung bình khá' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Sử dụng đáng kể' })
  @IsOptional()
  @IsString()
  usageLevel?: string;

  @ApiProperty({
    example:
      'Tình trạng trung bình, có dấu hiệu sử dụng đáng kể, mép mòn, vết nhăn, hoặc giấy hơi dính. Nội dung vẫn nguyên vẹn và rõ ràng.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isRemarkable?: boolean;
}
