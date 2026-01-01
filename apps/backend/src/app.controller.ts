import { Controller, Get } from '@nestjs/common';

@Controller('app')
export class AppController {
  @Get('version')
  getVersion() {
    return {
      version: '1.0.1',
      downloadUrl: 'https://dexterzbackend.online/downloads/TimeTracker-Setup.exe',
      releaseNotes: 'Bug fixes and performance improvements',
      mandatory: false,
    };
  }
}
