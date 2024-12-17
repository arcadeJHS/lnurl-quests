import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class ValidateQuestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsObject()
  // TODO: define a better typescript interface that "any"
  // scenario is the answer/solution submitted by the user
  scenario: Record<string, any>;
}
