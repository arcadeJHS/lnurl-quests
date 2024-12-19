import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiTags,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiProperty,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '@common/guards/api-key.guard';
import { ValidateQuestDto } from '@quests/dto/validate-quest.dto';
import {
  HttpExceptionFilter,
  HttpExceptionResponse,
} from '../common/filters/http-exception.filter';
import { QuestValidationService } from './quest-validate.service';
import { QuestValidationError } from './interfaces/quest-validation-error.enum';

class ValidationHttpExceptionResponse implements HttpExceptionResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    enum: QuestValidationError,
    example: QuestValidationError.QUEST_IS_NOT_ACTIVE,
  })
  message: string;

  @ApiProperty({ example: '2024-12-18T10:32:28.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/quests/validate' })
  path: string;
}

/**
 * Methods defined here require cross-module access to different services.
 * Hence are implemented here, and not in the QuestsController directly.
 */
@ApiTags('Quests')
@ApiHeader({
  name: 'X-Api-Key',
  description: 'Authorization key',
})
@UseFilters(HttpExceptionFilter)
@Controller('quests')
@UseGuards(ApiKeyGuard)
export class QuestValidateController {
  constructor(
    private readonly questValidationService: QuestValidationService,
  ) {}

  @Post('validate')
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiCreatedResponse({
    description: 'Quest validation successful',
    schema: { type: 'string', example: '6763bd1117ecd58a05465666' },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request',
    type: ValidationHttpExceptionResponse,
  })
  async validate(@Body() validateQuestDto: ValidateQuestDto): Promise<string> {
    return this.questValidationService.validateQuest(validateQuestDto);
  }
}
