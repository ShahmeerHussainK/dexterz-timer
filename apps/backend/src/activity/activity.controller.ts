import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ActivityService } from './activity.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivityBatchItem } from '@time-tracker/shared';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post('sessions/start')
  async startSession(
    @Request() req,
    @Body() body: { deviceId: string; platform: string },
  ) {
    return this.activityService.startSession(req.user.id, body.deviceId, body.platform);
  }

  @Post('sessions/stop')
  async stopSession(@Body() body: { sessionId: string }) {
    return this.activityService.stopSession(body.sessionId);
  }

  @Post('batch')
  async batchUpload(@Request() req, @Body() body: { samples: ActivityBatchItem[]; projectId?: string }) {
    console.log(`\n\n========== BATCH UPLOAD DEBUG ==========`);
    console.log(`User: ${req.user.id}`);
    console.log(`Project ID: ${body.projectId || 'None'}`);
    console.log(`Samples count: ${body.samples?.length || 0}`);
    
    if (body.samples && body.samples.length > 0) {
      const first = body.samples[0];
      console.log(`\nFirst sample RAW:`);
      console.log(JSON.stringify(first, null, 2));
      console.log(`\nactiveSeconds value: ${first.activeSeconds}`);
      console.log(`activeSeconds type: ${typeof first.activeSeconds}`);
    }
    console.log(`========================================\n\n`);
    
    return this.activityService.batchUpload(req.user.id, body.samples, body.projectId);
  }

  @Get('recent')
  async getRecent(@Request() req, @Query('limit') limit?: string) {
    return this.activityService.getRecentActivity(
      req.user.id,
      limit ? parseInt(limit) : 100,
    );
  }

  @Get('active-users')
  async getActiveUsers() {
    return this.activityService.getActiveUsers();
  }

  @Post('rollup')
  async triggerRollup(@Request() req) {
    console.log(`🎯 Rollup endpoint hit by user: ${req.user.id}`);
    const result = await this.activityService.triggerRollup(req.user.id);
    console.log(`📊 Rollup result:`, result);
    return result;
  }
}
