import { ApiProperty } from '@nestjs/swagger';
import { HttpExceptionResponse } from './http-exception.filter';

export class ValidationHttpExceptionResponse<T extends string>
  implements HttpExceptionResponse
{
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({
    description: 'Error message',
    oneOf: [{ type: 'string' }, { type: 'number' }],
    example: 'Example error message',
  })
  message: T;

  @ApiProperty({ example: '2024-12-18T10:32:28.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'Example path' })
  path: string;
}
