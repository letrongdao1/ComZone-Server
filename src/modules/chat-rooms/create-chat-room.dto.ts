import { ApiProperty } from '@nestjs/swagger';

export class CreateChatRoomDTO {
  @ApiProperty()
  secondUser: string;

  @ApiProperty({
    nullable: true,
  })
  comics: string;

  @ApiProperty({
    nullable: true,
  })
  exchangeRequest: string;
}
