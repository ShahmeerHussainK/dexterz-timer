import { Controller, Post, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ManualTimeService } from './manual-time.service';
import { CreateManualTimeRequestDto } from './dto/create-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AddManualTimeDto } from './dto/add-manual-time.dto';
import { ManualTimeStatus } from '@prisma/client';

@Controller('manual-time')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ManualTimeController {
  constructor(private manualTimeService: ManualTimeService) {}

  @Post('request')
  @Roles('MEMBER', 'MANAGER', 'ADMIN', 'OWNER')
  createRequest(
    @CurrentUser() user: any,
    @Body() dto: CreateManualTimeRequestDto,
  ) {
    return this.manualTimeService.createRequest(user.userId, dto);
  }

  @Get('my-requests')
  @Roles('MEMBER', 'MANAGER', 'ADMIN', 'OWNER')
  getMyRequests(@CurrentUser() user: any) {
    return this.manualTimeService.getMyRequests(user.userId);
  }

  @Get('pending')
  @Roles('MANAGER', 'ADMIN', 'OWNER')
  getPendingRequests(@CurrentUser() user: any) {
    return this.manualTimeService.getPendingRequests(user.orgId, user.role, user.userId);
  }

  @Patch('review/:id')
  @Roles('MANAGER', 'ADMIN', 'OWNER')
  reviewRequest(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReviewRequestDto,
  ) {
    return this.manualTimeService.reviewRequest(id, user.userId, dto);
  }

  @Post('add')
  @Roles('ADMIN', 'OWNER')
  addManualTime(
    @CurrentUser() user: any,
    @Body() dto: AddManualTimeDto,
  ) {
    return this.manualTimeService.addManualTime(user.userId, dto);
  }

  @Get('user/:userId')
  @Roles('MANAGER', 'ADMIN', 'OWNER')
  getUserRequests(
    @Param('userId') userId: string,
    @Query('status') status?: ManualTimeStatus,
  ) {
    return this.manualTimeService.getUserRequests(userId, status);
  }
}
