import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  minAmount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxAmount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  defaultDescription?: string;
}

export class HandleWithdrawRequestDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  q: string;
}

export class WithdrawCallbackDto {
  @ApiProperty()
  @IsNotEmpty()
  k1: string;

  @ApiProperty()
  @IsNotEmpty()
  pr: string;
}
