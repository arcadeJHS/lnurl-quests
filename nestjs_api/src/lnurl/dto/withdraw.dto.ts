import { IsNumber, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  @IsNotEmpty()
  @ApiProperty()
  k1: string;

  @IsNotEmpty()
  @ApiProperty()
  pr: string;
}
