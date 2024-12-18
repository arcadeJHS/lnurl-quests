import { Injectable } from '@nestjs/common';
import { ClaimRepository } from './repositories/claim.repository';
import { Claim } from './schemas/claim.schema';
import { ClaimDto } from './dto/claim.dto';
import { LnbitsLightningService } from '@lnurl/services/lnbits-lightning.service';

@Injectable()
export class ClaimService {
  constructor(
    private repository: ClaimRepository,
    private lnbitsLightningService: LnbitsLightningService,
  ) {}

  async create(claimDto: ClaimDto): Promise<Claim> {
    return await this.repository.create(claimDto);
  }

  async findOne(id: string): Promise<Claim | null> {
    return await this.repository.findOne(id);
  }

  async update(id: string, claimDto: ClaimDto): Promise<Claim> {
    return await this.repository.update(id, claimDto);
  }

  // TODO: which params should be passed to generateLnurl?
  async generateLnurl(claimDto: ClaimDto): Promise<Claim> {
    // const questId = claimDto.questId;
    // // TODO: get quests reward info from DB: can I get from there the params required by lnbitsLightningService.generateWithdrawUrl?
    // const lnurlWithdraw = await this.lnbitsLightningService.generateWithdrawUrl(
    //   {
    //     minWithdrawable: 100,
    //     maxWithdrawable: 500,
    //     defaultDescription: 'Reward for completing a quest',
    //   },
    // );
    // // TODO: update claim after LNURL generation and return it
    // return await this.repository.update(claimDto._id, claimDto);

    // TODO: remove and update with real logic
    return await this.repository.create(claimDto);
  }
}
