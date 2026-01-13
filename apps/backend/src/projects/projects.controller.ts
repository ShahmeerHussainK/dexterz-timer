import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  create(@CurrentUser() user: any, @Body() body: { name: string; description?: string; color?: string; teamId?: string }) {
    return this.projectsService.create(user.orgId, user.id, body);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.projectsService.findAll(user.orgId, status);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.findOne(id, user.orgId);
  }

  @Put(':id')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    return this.projectsService.update(id, user.orgId, body);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.projectsService.delete(id, user.orgId);
  }
}
