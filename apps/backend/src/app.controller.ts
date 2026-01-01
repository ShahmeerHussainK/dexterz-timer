import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get('version')
  getVersion() {
    return {
      version: '1.0.2',
      downloadUrl: 'https://dexterzbackend.online/downloads/TimeTracker-Setup.exe',
      releaseNotes: 'Production URLs updated + Bug fixes',
      mandatory: false,
    };
  }
}
