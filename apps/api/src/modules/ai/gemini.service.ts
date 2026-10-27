import { Injectable, Logger } from '@nestjs/common';
import { getEnv } from '../../config/env';
import { AppError } from '../../common/errors';

export interface GeminiResult {
  text: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}

type JsonSchema = Record<string, unknown>;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  isConfigured(): boolean {
    return Boolean(getEnv().GEMINI_API_KEY);
  }

  async generateJson(input: {
    system: string;
    prompt: string;
    schema: JsonSchema;
    temperature: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    model?: string;
  }): Promise<GeminiResult> {
    return this.call({
      ...input,
      responseMimeType: 'application/json',
      responseSchema: input.schema,
    });
  }

  async generateText(input: {
    system: string;
    prompt: string;
    temperature: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    model?: string;
  }): Promise<GeminiResult> {
    return this.call({ ...input, responseMimeType: 'text/plain' });
  }

  private async call(input: {
    system: string;
    prompt: string;
    temperature: number;
    maxOutputTokens?: number;
    timeoutMs?: number;
    responseMimeType: string;
    responseSchema?: JsonSchema;
    model?: string;
  }): Promise<GeminiResult> {
    const env = getEnv();
    if (!env.GEMINI_API_KEY) {
      throw new AppError('AI_NOT_CONFIGURED', 'The AI service is not configured', 503);
    }
    const models = [
      ...new Set(
        [input.model, env.GEMINI_MODEL, 'gemini-2.5-flash-lite', 'gemini-2.5-flash'].filter(
          (model): model is string => Boolean(model),
        ),
      ),
    ];
    const budgetMs = input.timeoutMs ?? 20_000;
    const deadline = Date.now() + budgetMs;
    let lastError: unknown;
    for (const model of models) {
      const remaining = deadline - Date.now();
      if (remaining < 800) break;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), remaining);
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: input.system }] },
              contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
              generationConfig: {
                temperature: input.temperature,
                maxOutputTokens: input.maxOutputTokens ?? 1600,
                responseMimeType: input.responseMimeType,
                responseSchema: input.responseSchema,
              },
            }),
            signal: controller.signal,
          },
        );
        if (!response.ok) {
          const body = await response.text().catch(() => '');
          this.logger.warn(`gemini ${model} returned ${response.status}: ${body.slice(0, 100)}`);
          lastError = new AppError('AI_UNAVAILABLE', 'The AI service is unavailable right now', 503);
          if ([429, 503].includes(response.status)) continue;
          throw lastError;
        }
        const payload = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          usageMetadata?: {
            promptTokenCount?: number;
            candidatesTokenCount?: number;
            totalTokenCount?: number;
          };
        };
        const text =
          payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? '';
        if (!text.trim()) {
          lastError = new AppError('AI_EMPTY', 'The AI returned an empty answer', 503);
          continue;
        }
        return {
          text,
          promptTokens: payload.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: payload.usageMetadata?.candidatesTokenCount ?? 0,
          model,
        };
      } catch (error) {
        lastError = error;
        if (error instanceof AppError && error.code !== 'AI_UNAVAILABLE') throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
    if (lastError instanceof AppError) throw lastError;
    throw new AppError('AI_UNAVAILABLE', 'The AI service timed out. Try again.', 503);
  }
}
