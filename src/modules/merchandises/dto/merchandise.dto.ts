import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMerchandiseDTO {
  @ApiProperty({ example: 'Hộp đựng' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Box', nullable: true })
  @IsOptional()
  subName?: string;

  @ApiProperty({ example: 'Hộp để đựng' })
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Không quá bự', nullable: true })
  @IsOptional()
  caution?: string;
}

export class EditMerchandiseDTO {
  @ApiProperty({ example: 'Hộp đựng' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Box' })
  @IsOptional()
  subName?: string;

  @ApiProperty({ example: 'Hộp để đựng' })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'Không quá bự' })
  @IsOptional()
  caution?: string;
}
