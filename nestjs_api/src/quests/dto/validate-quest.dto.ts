import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class ValidateQuestDto {
  @ApiProperty({
    example: {
      questId: '676278b9847f7c325add7daf',
    },
  })
  @IsNotEmpty()
  @IsString()
  questId: string;

  @ApiProperty({
    example: {
      scenario: {
        wordsToGuess: ['quantum', 'blockchain', 'algorithm'],
      },
    },
  })
  @IsNotEmpty()
  @IsObject()
  // TODO: define a better typescript interface that "any"
  // scenario is the answer/solution submitted by the user
  scenario: Record<string, any>;
}
