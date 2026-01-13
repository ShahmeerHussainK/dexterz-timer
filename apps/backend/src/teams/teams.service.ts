import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, name: string, leadId?: string) {
    return this.prisma.team.create({
      data: { name, orgId, leadId },
      include: { lead: true, members: true },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.team.findMany({
      where: { orgId },
      include: { lead: true, members: true, _count: { select: { projects: true } } },
    });
  }

  async findOne(id: string, orgId: string) {
    const team = await this.prisma.team.findFirst({
      where: { id, orgId },
      include: { lead: true, members: true, projects: true },
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(id: string, orgId: string, data: { name?: string; leadId?: string }) {
    await this.findOne(id, orgId);
    return this.prisma.team.update({
      where: { id },
      data,
      include: { lead: true, members: true },
    });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.team.delete({ where: { id } });
  }

  async addMember(teamId: string, userId: string, orgId: string) {
    await this.findOne(teamId, orgId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { teamId },
    });
  }

  async removeMember(userId: string, orgId: string) {
    return this.prisma.user.update({
      where: { id: userId, orgId },
      data: { teamId: null },
    });
  }
}
