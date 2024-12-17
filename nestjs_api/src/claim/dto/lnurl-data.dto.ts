import { ApiProperty } from '@nestjs/swagger';
import { LnurlData } from '@common/interfaces/lnurl-data.interface';

export class LnurlDataDto implements LnurlData {
  @ApiProperty()
  encoded: string;

  @ApiProperty()
  secret: string;

  @ApiProperty()
  url: string;
}
