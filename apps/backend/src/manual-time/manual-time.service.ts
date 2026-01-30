import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManualTimeRequestDto } from './dto/create-request.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { AddManualTimeDto } from './dto/add-manual-time.dto';
import { ManualTimeStatus, TimeEntrySource } from '@prisma/client';

@Injectable()
export class ManualTimeService {
  constructor(private prisma: PrismaService) {}

  async createRequest(userId: string, dto: CreateManualTimeRequestDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const now = new Date();

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Prevent future time entries
    if (startTime > now) {
      throw new BadRequestException('Cannot create manual time for future');
    }

    if (endTime > now) {
      throw new BadRequestException('End time cannot be in the future');
    }

    const calculatedMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    if (calculatedMinutes !== dto.minutes) {
      throw new BadRequestException('Minutes do not match time range');
    }

    // NEW VALIDATION: Check if tracker was ON during this time (device session existed)
    const activeSession = await this.prisma.deviceSession.findFirst({
      where: {
        userId,
        startedAt: { lte: endTime },
        OR: [
          { endedAt: { gte: startTime } },
          { endedAt: null }, // Still active session
        ],
      },
    });

    if (!activeSession) {
      throw new BadRequestException('Cannot request manual time: Tracker was not running during this period');
    }

    // NEW VALIDATION: Check if IDLE time exists in this range
    const idleEntries = await this.prisma.timeEntry.findMany({
      where: {
        userId,
        kind: 'IDLE',
        source: 'AUTO',
        startedAt: { lt: endTime },
        endedAt: { gt: startTime },
      },
    });

    if (idleEntries.length === 0) {
      throw new BadRequestException('Cannot request manual time: No idle time found in this period');
    }

    // Check for overlapping ACTIVE or MANUAL entries (IDLE is allowed)
    const overlapping = await this.prisma.timeEntry.findFirst({
      where: {
        userId,
        kind: { not: 'IDLE' },
        OR: [
          {
            startedAt: { lte: startTime },
            endedAt: { gte: startTime },
          },
          {
            startedAt: { lte: endTime },
            endedAt: { gte: endTime },
          },
          {
            startedAt: { gte: startTime },
            endedAt: { lte: endTime },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Time range overlaps with existing active entry');
    }

    return this.prisma.manualTimeRequest.create({
      data: {
        userId,
        startTime,
        endTime,
        minutes: dto.minutes,
        reason: dto.reason,
        type: dto.type,
        status: ManualTimeStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async getMyRequests(userId: string) {
    return this.prisma.manualTimeRequest.findMany({
      where: { userId },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingRequests(orgId: string, userRole: string, userId: string) {
    // Admin/Owner can see all pending requests
    if (userRole === 'ADMIN' || userRole === 'OWNER') {
      return this.prisma.manualTimeRequest.findMany({
        where: {
          status: ManualTimeStatus.PENDING,
          user: { orgId },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              teamId: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Manager can see requests from their team members
    if (userRole === 'MANAGER') {
      const team = await this.prisma.team.findFirst({
        where: { leadId: userId },
      });

      if (!team) {
        return [];
      }

      return this.prisma.manualTimeRequest.findMany({
        where: {
          status: ManualTimeStatus.PENDING,
          user: {
            teamId: team.id,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              teamId: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    return [];
  }

  async reviewRequest(requestId: string, reviewerId: string, dto: ReviewRequestDto) {
    const request = await this.prisma.manualTimeRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (request.status !== ManualTimeStatus.PENDING) {
      throw new BadRequestException('Request already reviewed');
    }

    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
    });

    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    // Check permissions
    if (reviewer.role === 'MEMBER') {
      throw new ForbiddenException('Members cannot review requests');
    }

    if (reviewer.role === 'MANAGER') {
      const team = await this.prisma.team.findFirst({
        where: { leadId: reviewerId },
      });

      if (!team || request.user.teamId !== team.id) {
        throw new ForbiddenException('You can only review requests from your team members');
      }
    }

    // Update request
    const updated = await this.prisma.manualTimeRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNote: dto.reviewNote,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        reviewer: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    // If approved, create manual time entry
    if (dto.status === ManualTimeStatus.APPROVED) {
      // Check again for overlapping entries before creating
      const overlapping = await this.prisma.timeEntry.findFirst({
        where: {
          userId: request.userId,
          OR: [
            {
              startedAt: { lte: request.startTime },
              endedAt: { gte: request.startTime },
            },
            {
              startedAt: { lte: request.endTime },
              endedAt: { gte: request.endTime },
            },
            {
              startedAt: { gte: request.startTime },
              endedAt: { lte: request.endTime },
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException('Cannot approve: Time range overlaps with existing entry');
      }

      await this.prisma.timeEntry.create({
        data: {
          userId: request.userId,
          startedAt: request.startTime,
          endedAt: request.endTime,
          kind: request.type,
          source: TimeEntrySource.MANUAL,
        },
      });
    }

    return updated;
  }

  async addManualTime(adminId: string, dto: AddManualTimeDto) {
    const admin = await this.prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (admin.role !== 'ADMIN' && admin.role !== 'OWNER') {
      throw new ForbiddenException('Only admins can directly add manual time');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);
    const now = new Date();

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (endTime > now) {
      throw new BadRequestException('End time cannot be in the future');
    }

    const calculatedMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
    if (calculatedMinutes !== dto.minutes) {
      throw new BadRequestException('Minutes do not match time range');
    }

    // Check for overlapping time entries
    const overlapping = await this.prisma.timeEntry.findFirst({
      where: {
        userId: dto.userId,
        OR: [
          {
            startedAt: { lte: startTime },
            endedAt: { gte: startTime },
          },
          {
            startedAt: { lte: endTime },
            endedAt: { gte: endTime },
          },
          {
            startedAt: { gte: startTime },
            endedAt: { lte: endTime },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('Time range overlaps with existing entry');
    }

    // Create approved request record
    const request = await this.prisma.manualTimeRequest.create({
      data: {
        userId: dto.userId,
        startTime,
        endTime,
        minutes: dto.minutes,
        reason: dto.reason,
        type: dto.type,
        status: ManualTimeStatus.APPROVED,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    // Create time entry
    await this.prisma.timeEntry.create({
      data: {
        userId: dto.userId,
        startedAt: startTime,
        endedAt: endTime,
        kind: dto.type,
        source: TimeEntrySource.MANUAL,
      },
    });

    return request;
  }

  async getUserRequests(userId: string, status?: ManualTimeStatus) {
    return this.prisma.manualTimeRequest.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        reviewer: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
