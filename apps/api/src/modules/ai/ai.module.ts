import { Global, Module } from '@nestjs/common';
import { AiSettingsService } from './ai-settings.service';
import { AiUsageService } from './ai-usage.service';
import { GeminiService } from './gemini.service';
import { GuardrailService } from './guardrail.service';

@Global()
@Module({
  providers: [AiSettingsService, AiUsageService, GeminiService, GuardrailService],
  exports: [AiSettingsService, AiUsageService, GeminiService, GuardrailService],
})
export class AiModule {}
