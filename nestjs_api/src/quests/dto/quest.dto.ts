import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class QuestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  rewardAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  totalRewards: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  claimedRewards?: number;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  conditions: Record<string, any>;
}
