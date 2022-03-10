import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class PaymentDto {
  @ApiProperty()
  @IsNumber()
  amount: number;
}

export class RewardDto extends PaymentDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty()
  @IsString()
  payer: string;
}

export type Ledger = Array<RewardDto>;
