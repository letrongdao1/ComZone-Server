import { ApiProperty } from '@nestjs/swagger';

export class SendSMSDTO {
  @ApiProperty({ example: 'Số điện thoại nhận tin nhắn' })
  phone: string;

  @ApiProperty({ example: 'Mã OTP' })
  content: string;
}
