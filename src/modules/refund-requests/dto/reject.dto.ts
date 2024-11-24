import { ApiProperty } from '@nestjs/swagger';

export class RejectReasonDTO {
  @ApiProperty()
  rejectReason: string;
}
