import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapingModule } from './scraping/scraping.module';
import { AssistantController } from './assistant.controller';

@Module({
  imports: [ScrapingModule],
  controllers: [AppController, AssistantController],
  providers: [AppService],
})
export class AppModule {}
