import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UserDto {
  @ApiProperty()
  @IsString()
  firstName: string;
  @ApiProperty()
  @IsString()
  lastName: string;
  @ApiProperty()
  @IsNumber()
  points: number;
  @ApiProperty()
  @IsUUID()
  id: string;
}
export class UpdateUserDto extends PartialType(
  OmitType(UserDto, ['id'] as const),
) {}
