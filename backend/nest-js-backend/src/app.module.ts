import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScrapingModule } from './scraping/scraping.module';
import { AssistantController } from './assistant.controller';
import { AiController } from './ai/ai.controller';
import { FirebaseAuthGuard } from './auth/firebase-auth.guard';
import { FirebaseAuthService } from './auth/firebase-auth.service';
import { UserThrottlerGuard } from './auth/user-throttler.guard';

@Module({
  imports: [
    ScrapingModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
  ],
  controllers: [AppController, AssistantController, AiController],
  providers: [
    AppService,
    FirebaseAuthService,
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserThrottlerGuard,
    },
  ],
})
export class AppModule {}
