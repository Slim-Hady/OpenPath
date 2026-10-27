import { Injectable } from '@nestjs/common';
import type { GuardrailOutcome } from '@osh/contracts';

export const REFUSAL_MESSAGE = `I can't write the fix for you — but I can get you there.

1. Reproduce the problem locally and note the exact error or unexpected behaviour.
2. Open the file named in the issue and read the surrounding code before changing it.
3. Compare it with a similar pattern that already exists in the repository.
4. Ask me what a specific line does, or how to verify your change.

I can explain concepts, suggest investigation steps and point you to documentation. The implementation has to be yours.`;

export const STRIPPED_NOTE =
  'I removed a code block from that answer. Ask me for the next step instead.';

const SOLUTION_REQUEST_PATTERNS: RegExp[] = [
  /\b(write|give|show|send|paste|provide|generate|produce)\b[^.\n]{0,40}\b(fix|code|patch|diff|implementation|solution|answer|snippet|function|component)\b/i,
  /\b(implement|solve|fix)\b[^.\n]{0,20}\b(this|the|it|my)\b[^.\n]{0,30}\b(issue|bug|problem|feature|task)\b/i,
  /\bjust\s+(the\s+)?(patch|code|diff)\b/i,
  /\boutput\s+(the\s+)?(solution|code|patch)\b/i,
  /\bignore\s+(your|the)\s+(rules|instructions|guardrails)\b/i,
  /\b(jailbreak|prompt\s*injection|developer\s*mode)\b/i,
  /\b(give|show)\s+me\s+(the|a|an)\s+(complete|full|working)\s+(implementation|solution|function)\b/i,
  /\bhow\s+(do|can)\s+i\s+(fix|implement|solve)\b[^?]{0,40}\?/i,
];

const CODE_LINE_PATTERNS: RegExp[] = [
  /^\s*(import|export)\s+/,
  /^\s*(const|let|var)\s+[\w{[]/,
  /^\s*(function|class|interface|type|enum)\s+\w/,
  /^\s*(def|class)\s+\w+\s*[:(]/,
  /^\s*(public|private|protected|static)\s+\w/,
  /^\s*(return|throw)\s+[^;]+;/,
  /^\s*(if|for|while|switch)\s*\(.*\)\s*\{?\s*$/,
  /^\s*#include\s*</,
  /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE)\s+/i,
  /^\s*<\?php/,
  /^\s*<\/?[a-z][\w-]*(\s|>)/i,
  /^\s*@\w+\(/,
];

@Injectable()
export class GuardrailService {
  asksForSolution(text: string): boolean {
    return SOLUTION_REQUEST_PATTERNS.some((pattern) => pattern.test(text));
  }

  isCodeFree(text: string): boolean {
    if (/```/.test(text)) return false;
    if (/^(diff --git|@@|\+\+\+|---)\s?/m.test(text)) return false;
    if (this.hasInlineCode(text)) return false;
    return !text.split('\n').some((line) => this.isCodeLine(line));
  }

  private hasInlineCode(text: string): boolean {
    const spans = text.matchAll(/`([^`]+)`/g);
    for (const span of spans) {
      if (span[1] && this.isCodeSpan(span[1])) return true;
    }
    return false;
  }

  private isCodeSpan(value: string): boolean {
    return /(=>|;\s*$|\breturn\b|\bconst\b|\blet\b|\bvar\b|\bfunction\b|\bclass\b|\bif\s*\(|\bfor\s*\(|\bimport\s+|\bexport\s+|[{}]\s*;)/.test(
      value.trim(),
    );
  }

  private isCodeLine(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('```')) return true;
    if (CODE_LINE_PATTERNS.some((pattern) => pattern.test(line))) return true;
    const braces = (trimmed.match(/[{}]/g) ?? []).length;
    const semicolons = (trimmed.match(/;/g) ?? []).length;
    if (braces >= 2 && (semicolons > 0 || /=>/.test(trimmed))) return true;
    if (/^[-+]\s*[\w.[\]()]+\s*[=:(]/.test(trimmed) && /[;{}]/.test(trimmed)) return true;
    return false;
  }

  /** Remove fenced blocks, diffs and code lines from generated prose. */
  stripCode(raw: string): { text: string; changed: boolean } {
    let changed = false;
    let text = raw.replace(/```[\s\S]*?```/g, () => {
      changed = true;
      return '';
    });
    text = text.replace(/^(diff --git[\s\S]*?)(?=\n\n|$)/gm, () => {
      changed = true;
      return '';
    });
    text = text.replace(/`([^`]+)`/g, (span, inner: string) => {
      if (!this.isCodeSpan(inner)) return span;
      changed = true;
      return '';
    });
    const lines = text.split('\n');
    const kept: string[] = [];
    for (const line of lines) {
      if (this.isCodeLine(line)) {
        changed = true;
        continue;
      }
      if (/^(---|\+\+\+|@@)/.test(line.trim())) {
        changed = true;
        continue;
      }
      kept.push(line);
    }
    return { text: kept.join('\n').replace(/\n{3,}/g, '\n\n').trim(), changed };
  }

  finalize(
    raw: string,
    options: { askedForSolution: boolean },
  ): { content: string; outcome: GuardrailOutcome; refusal: boolean; strippedCode: boolean } {
    if (options.askedForSolution) {
      return { content: REFUSAL_MESSAGE, outcome: 'REFUSED', refusal: true, strippedCode: false };
    }
    const stripped = this.stripCode(raw);
    if (stripped.changed) {
      const content = stripped.text
        ? `${stripped.text}\n\n${STRIPPED_NOTE}`
        : REFUSAL_MESSAGE;
      return {
        content,
        outcome: 'STRIPPED',
        refusal: !stripped.text,
        strippedCode: true,
      };
    }
    if (!this.isCodeFree(raw)) {
      return { content: REFUSAL_MESSAGE, outcome: 'REFUSED', refusal: true, strippedCode: true };
    }
    return { content: raw.trim(), outcome: 'PASSED', refusal: false, strippedCode: false };
  }

  /** For structured onboarding fields: never return implementation code. */
  sanitizeField(raw: string): string {
    const stripped = this.stripCode(raw);
    if (!stripped.changed) return raw.trim();
    return stripped.text || 'Read the related files in the repository before changing anything.';
  }
}
