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

  async update(id: string, withdraw: Partial<Withdraw>): Promise<Withdraw> {
    return await this.withdrawModel.findByIdAndUpdate(id, withdraw).exec();
  }

  async findUnusedByK1(k1: string): Promise<Withdraw | null> {
    return this.withdrawModel.findOne({
      k1,
      $or: [{ used: false }, { used: true, paymentHash: null }],
    });
  }

  async markAsUsed(id: string, paymentHash: string): Promise<Withdraw> {
    return await this.withdrawModel.findByIdAndUpdate(id, {
      used: true,
      usedAt: new Date(),
      paymentHash,
    });
  }
}
