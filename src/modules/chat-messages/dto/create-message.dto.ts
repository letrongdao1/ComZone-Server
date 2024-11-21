import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty()
  userId: string;

  @ApiProperty()
  chatRoom: string;

  @ApiProperty({ example: 'TEXT', default: 'TEXT' })
  type: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  repliedToMessage?: string;

  @ApiProperty({ nullable: true })
  comics?: string[];
}
