import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  IsNotEmptyObject,
  ValidateNested,
} from 'class-validator';

export class BaseQuestDto {
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
  // With transform: true, input like "2024-12-15T20:24:05Z" will be converted to a Date
  startDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => Object)
  conditions: Record<string, any>;
}
