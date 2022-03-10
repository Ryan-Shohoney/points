import {ApiProperty, PickType} from '@nestjs/swagger';
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

export class PaymentResponseDto extends PickType(RewardDto, ['payer']) {
  deduction: number;
  balance: number;
}
