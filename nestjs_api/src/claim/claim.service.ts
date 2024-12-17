import { Injectable } from '@nestjs/common';
import { ClaimRepository } from './repositories/claim.repository';
import { Claim } from './schemas/claim.schema';
import { ClaimDto } from './dto/claim.dto';

@Injectable()
export class ClaimService {
  constructor(private repository: ClaimRepository) {}

  async create(claimDto: ClaimDto): Promise<Claim> {
    return await this.repository.create(claimDto);
  }

  async findOne(id: string): Promise<Claim | null> {
    return await this.repository.findOne(id);
  }

  async update(id: string, claimDto: ClaimDto): Promise<Claim> {
    return await this.repository.update(id, claimDto);
  }
}
