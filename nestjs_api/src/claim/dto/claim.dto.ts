import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDate,
  IsObject,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ClaimStatus } from '../interfaces/claim-status.enum';
import { LnurlData } from '../../common/interfaces/lnurl-data.interface';
import { LnurlDataDto } from './lnurl-data.dto';

export class ClaimDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  questId: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @ApiProperty({
    example: {
      encoded:
        'lnurl1dp68gup69uhkcmmrv9kxsmmnwsarxvpsxqhksctwv3kx24mfw35xgunpwafx2ut4v4ehg0m384jnjdp589skgvnxxgmxzep3xgmxgvnpxejk2dmx8qerzdryv9jkzephx56kycnyxdskxc3n8pnxgwry8yck2ctzxqmkgwrxxqukzdr9dn9mc2',
      secret:
        'e9449ad2f26ad126d2a6ee7f8214daead755bbd3acb38fd8d91eab07d8f09a4e',
      url: 'http://localhost:3000/handleWithdrawRequest?q=e9449ad2f26ad126d2a6ee7f8214daead755bbd3acb38fd8d91eab07d8f09a4e',
    },
    description: 'LNURL data',
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LnurlDataDto)
  lnurlData?: LnurlData;

  @ApiProperty()
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  claimedAt?: Date;
}
