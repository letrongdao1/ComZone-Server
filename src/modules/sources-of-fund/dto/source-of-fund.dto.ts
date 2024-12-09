import { ApiProperty } from '@nestjs/swagger';

export class SourceOfFundDTO {
  @ApiProperty()
  number: string;

  @ApiProperty()
  owner: string;

  @ApiProperty()
  bankName: string;

  @ApiProperty()
  logo: string;
}
