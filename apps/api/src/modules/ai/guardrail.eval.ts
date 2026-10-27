import { GuardrailService } from './guardrail.service';
import { GUARDRAIL_CASES, assertCase } from './guardrail.cases';

const guardrail = new GuardrailService();

let failures = 0;
for (const testCase of GUARDRAIL_CASES) {
  const askedForSolution = guardrail.asksForSolution(testCase.request);
  const result = guardrail.finalize(testCase.modelOutput, { askedForSolution });
  try {
    assertCase(result, testCase.expected);
    console.log(`PASS  ${testCase.name}`);
  } catch (error) {
    failures += 1;
    console.log(`FAIL  ${testCase.name}: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

const total = GUARDRAIL_CASES.length;
console.log(`\n${total - failures}/${total} guardrail cases passed`);
if (failures > 0) {
  process.exitCode = 1;
}
