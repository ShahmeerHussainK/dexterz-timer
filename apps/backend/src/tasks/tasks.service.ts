import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createdById: string, data: { title: string; description?: string; projectId: string; assignedTo?: string; priority?: any; dueDate?: Date }) {
    return this.prisma.task.create({
      data: { ...data, createdById },
      include: { project: true, assignee: true, createdBy: true },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: { projectId },
      include: { assignee: true, createdBy: true, _count: { select: { timeEntries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.task.findMany({
      where: { assignedTo: userId },
      include: { project: true, createdBy: true, _count: { select: { timeEntries: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: true, assignee: true, createdBy: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, data: { title?: string; description?: string; assignedTo?: string; status?: any; priority?: any; dueDate?: Date }) {
    await this.findOne(id);
    return this.prisma.task.update({
      where: { id },
      data,
      include: { project: true, assignee: true },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.task.delete({ where: { id } });
  }
}
