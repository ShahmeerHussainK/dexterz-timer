import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(orgId: string, createdById: string, data: { name: string; description?: string; color?: string; teamId?: string }) {
    return this.prisma.project.create({
      data: { ...data, orgId, createdById },
      include: { team: true, createdBy: true, _count: { select: { tasks: true } } },
    });
  }

  async findAll(orgId: string, status?: any) {
    return this.prisma.project.findMany({
      where: { orgId, ...(status && { status }) },
      include: { team: true, createdBy: true, _count: { select: { tasks: true, timeEntries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, orgId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, orgId },
      include: { team: { include: { members: true } }, createdBy: true, tasks: { include: { assignee: true } } },
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, orgId: string, data: { name?: string; description?: string; color?: string; teamId?: string; status?: any }) {
    await this.findOne(id, orgId);
    return this.prisma.project.update({
      where: { id },
      data,
      include: { team: true, createdBy: true },
    });
  }

  async delete(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.project.delete({ where: { id } });
  }
}
