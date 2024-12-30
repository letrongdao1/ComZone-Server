import { Controller, Post, Body } from '@nestjs/common';
import { AiIntegrationService } from './ai-integration.service';

@Controller('ai-integration')
export class AiIntegrationController {
  constructor(private readonly aiIntegrationService: AiIntegrationService) {}

  @Post('analyze/edition')
  async analyzeComic(
    @Body('info') info: string,
  ): Promise<{ edition: string; value: number }> {
    return this.aiIntegrationService.analyzeComic(info);
  }
}
