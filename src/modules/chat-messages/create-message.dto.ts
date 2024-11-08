import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDTO {
  @ApiProperty()
  token: string;

  @ApiProperty()
  chatRoom: string;

  @ApiProperty({ example: 'TEXT', default: 'TEXT' })
  type: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ nullable: true })
  repliedToMessage?: string;
}
