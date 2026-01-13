import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('teams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  @Roles('OWNER', 'ADMIN')
  create(@CurrentUser() user: any, @Body() body: { name: string; leadId?: string }) {
    return this.teamsService.create(user.orgId, body.name, body.leadId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.teamsService.findAll(user.orgId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.teamsService.findOne(id, user.orgId);
  }

  @Put(':id')
  @Roles('OWNER', 'ADMIN')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { name?: string; leadId?: string }) {
    return this.teamsService.update(id, user.orgId, body);
  }

  @Delete(':id')
  @Roles('OWNER', 'ADMIN')
  delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.teamsService.delete(id, user.orgId);
  }

  @Post(':id/members')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  addMember(@CurrentUser() user: any, @Param('id') teamId: string, @Body() body: { userId: string }) {
    return this.teamsService.addMember(teamId, body.userId, user.orgId);
  }

  @Delete('members/:userId')
  @Roles('OWNER', 'ADMIN', 'MANAGER')
  removeMember(@CurrentUser() user: any, @Param('userId') userId: string) {
    return this.teamsService.removeMember(userId, user.orgId);
  }
}
