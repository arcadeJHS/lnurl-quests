import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateQuestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer?: string;
}
