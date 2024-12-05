import { ApiProperty } from '@nestjs/swagger';

export class SendSMSDTO {
  @ApiProperty()
  phone: string;

  @ApiProperty()
  content: string;
}
