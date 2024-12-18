import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClaimService } from './claim.service';
import { ClaimController } from './claim.controller';
import { Claim, ClaimSchema } from './schemas/claim.schema';
import { ClaimRepository } from './repositories/claim.repository';
import { LnurlModule } from '../lnurl/lnurl.module';

@Module({
  imports: [
    ConfigModule,
    LnurlModule,
    MongooseModule.forFeature([{ name: Claim.name, schema: ClaimSchema }]),
  ],
  providers: [ClaimService, ClaimRepository],
  controllers: [ClaimController],
})
export class ClaimModule {}
