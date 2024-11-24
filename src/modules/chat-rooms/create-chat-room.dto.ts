import { ApiProperty } from '@nestjs/swagger';

export class CreateComicsChatRoomDTO {
  @ApiProperty()
  comics: string;
}

export class CreateExchangeChatRoomDTO {
  @ApiProperty()
  exchange: string;
}
