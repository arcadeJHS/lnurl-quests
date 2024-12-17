import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Claim } from '../schemas/claim.schema';
import { ClaimDto } from '../dto/claim.dto';

@Injectable()
export class ClaimRepository {
  constructor(@InjectModel(Claim.name) private claimModel: Model<Claim>) {}

  async create(claimDto: ClaimDto): Promise<Claim> {
    const quest = new this.claimModel(claimDto);
    return quest.save();
  }

  async findOne(id: string): Promise<Claim | null> {
    return await this.claimModel.findById(id).exec();
  }

  async update(id: string, claimDto: ClaimDto): Promise<Claim> {
    return await this.claimModel.findByIdAndUpdate(id, claimDto).exec();
  }

  async delete(id: string): Promise<Claim> {
    return await this.claimModel.findByIdAndDelete(id).exec();
  }
}
