import { Module } from '@nestjs/common';
import { ManualTimeController } from './manual-time.controller';
import { ManualTimeService } from './manual-time.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ManualTimeController],
  providers: [ManualTimeService],
  exports: [ManualTimeService],
})
export class ManualTimeModule {}
