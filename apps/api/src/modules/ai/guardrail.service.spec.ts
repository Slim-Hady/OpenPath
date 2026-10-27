import { GuardrailService, REFUSAL_MESSAGE } from './guardrail.service';
import { GUARDRAIL_CASES, assertCase } from './guardrail.cases';

describe('GuardrailService', () => {
  const guardrail = new GuardrailService();

  it.each(GUARDRAIL_CASES)('$name', (testCase) => {
    const result = guardrail.finalize(testCase.modelOutput, {
      askedForSolution: guardrail.asksForSolution(testCase.request),
    });
    assertCase(result, testCase.expected);
  });

  it('refuses direct solution requests even when the model is polite', () => {
    expect(guardrail.asksForSolution('Can you solve this issue for me?')).toBe(true);
    const result = guardrail.finalize('I would start by reading the file.', {
      askedForSolution: guardrail.asksForSolution('Can you solve this issue for me?'),
    });
    expect(result.refusal).toBe(true);
    expect(result.content).toBe(REFUSAL_MESSAGE);
  });

  it('allows a concept question', () => {
    expect(guardrail.asksForSolution('What is a pull request?')).toBe(false);
  });

  it('never leaves an unfenced implementation in a safe answer', () => {
    const result = guardrail.finalize(
      'Try this:\nconst x = document.getElementById("a");\nconsole.log(x);',
      { askedForSolution: false },
    );
    expect(result.content).not.toContain('getElementById');
  });
});
