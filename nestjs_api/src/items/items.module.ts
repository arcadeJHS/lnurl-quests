import { Module } from '@nestjs/common';
import { ItemsController, WithdrawController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  controllers: [ItemsController, WithdrawController],
  providers: [ItemsService],
})
export class ItemsModule {}