import { Module } from '@nestjs/common';
import { ScreenshotsController } from './screenshots.controller';
import { ScreenshotsService } from './screenshots.service';
import { StorageService } from './storage.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScreenshotsController],
  providers: [ScreenshotsService, StorageService],
  exports: [ScreenshotsService],
})
export class ScreenshotsModule {}
