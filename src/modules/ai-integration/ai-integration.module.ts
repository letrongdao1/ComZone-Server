import { Module } from '@nestjs/common';
import { AiIntegrationService } from './ai-integration.service';
import { AiIntegrationController } from './ai-integration.controller';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [AiIntegrationController],
  providers: [
    AiIntegrationService,
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) =>
        new OpenAI({ apiKey: configService.getOrThrow('OPENAI_API_KEY') }),
      inject: [ConfigService],
    },
  ],
})
export class AiIntegrationModule {}
