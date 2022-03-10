import {ApiProperty} from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class PaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class RewardDto extends PaymentDto {
  @ApiProperty()
  @IsString()
  payer: string;

  @ApiProperty({
    description: 'The number of milliseconds since the start of the Unix epoch'
  })
  @IsNumber()
  timestampMS: number;

  receivedTs?: number;
}

export type Ledger = Array<RewardDto>;
