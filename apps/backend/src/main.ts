                                                                        import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase body size limit for screenshot uploads (50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS
  app.enableCors({
    origin:  ['http://localhost:3000'],
    credentials: true,
  });

  // API prefix (set BEFORE static assets)
  app.setGlobalPrefix('api');

  // Serve static files from public/downloads directory
  const downloadsPath = join(__dirname, '..', 'public', 'downloads');
  console.log('📁 Downloads path:', downloadsPath);
  console.log('📁 __dirname:', __dirname);
  
  app.useStaticAssets(downloadsPath, {
    prefix: '/downloads',
  });

  // Serve screenshots from public/screenshots directory
  const screenshotsPath = join(__dirname, '..', 'public', 'screenshots');
  app.useStaticAssets(screenshotsPath, {
    prefix: '/screenshots',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend API running on http://localhost:${port}/api`);
  console.log(`📦 Downloads available at http://localhost:${port}/downloads/`);
  console.log(`📸 Screenshots available at http://localhost:${port}/screenshots/`);
}

bootstrap();
