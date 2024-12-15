import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Withdraw } from '../schemas/withdraw.schema';

@Injectable()
export class WithdrawRepository {
  constructor(
    @InjectModel(Withdraw.name) private withdrawModel: Model<Withdraw>,
  ) {}

  async create(withdrawData: Partial<Withdraw>): Promise<Withdraw> {
    const withdraw = new this.withdrawModel(withdrawData);
    return withdraw.save();
  }

  async findUnusedByK1(k1: string): Promise<Withdraw | null> {
    return this.withdrawModel.findOne({ k1, used: false });
  }

  async markAsUsed(id: string, paymentHash: string): Promise<void> {
    await this.withdrawModel.findByIdAndUpdate(id, {
      used: true,
      usedAt: new Date(),
      paymentHash,
    });
  }
}
