import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get('version')
  getVersion() {
    return {
      version: '1.0.4',
      downloadUrl: 'https://dexterzbackend.online/downloads/TimeTracker-Setup.exe',
      releaseNotes: 'Teams, Projects, and Tasks management with project tracking in timelines',
      mandatory: false,
    };
  }
}
