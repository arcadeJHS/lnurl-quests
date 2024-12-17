import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { BaseQuestDto } from './base-quest.dto';

export class UpdateQuestDto extends BaseQuestDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  claimedRewards?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  active?: number;
}
