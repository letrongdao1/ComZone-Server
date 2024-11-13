import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { ExchangeComicsDTO } from 'src/modules/comics/dto/exchange-comics.dto';

export class CreateExchangePostDTO {
  @ApiProperty({
    type: Array(ExchangeComicsDTO),
    description: 'Array of requested comics',
  })
  @IsArray({ each: true })
  requestedComics: ExchangeComicsDTO[];

  @ApiProperty()
  postContent: string;
}

export class AcceptDealingExchangeDTO {
  @ApiProperty({
    description: 'ID of the exchange',
  })
  exchange: string;

  @ApiProperty({
    description: 'ID of the offer user',
  })
  offerUser: string;
}

export class UpdateDepositAmountDTO {
  @ApiProperty()
  amount: number;
}
