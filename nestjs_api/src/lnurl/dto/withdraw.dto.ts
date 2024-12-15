import { IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  minAmount: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  maxAmount: number;

  @ApiProperty({ required: false })
  defaultDescription: string;
}

export class WithdrawCallbackDto {
  @IsNotEmpty()
  @ApiProperty()
  k1: string;

  @IsNotEmpty()
  @ApiProperty()
  pr: string;
}
