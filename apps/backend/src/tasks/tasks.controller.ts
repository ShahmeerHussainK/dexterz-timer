import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() body: { title: string; description?: string; projectId: string; assignedTo?: string; priority?: string; dueDate?: string }) {
    const data = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    };
    return this.tasksService.create(user.id, data);
  }

  @Get('my-tasks')
  myTasks(@CurrentUser() user: any) {
    return this.tasksService.findByUser(user.id);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.tasksService.findByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { title?: string; description?: string; assignedTo?: string; status?: string; priority?: string; dueDate?: string }) {
    const data = {
      ...body,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    };
    return this.tasksService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.tasksService.delete(id);
  }
}
