/** Models sometimes wrap JSON in fences even when asked not to. */
export function parseJsonObject<T>(text: string): T {
  const withoutFences = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = withoutFences.indexOf('{');
  const end = withoutFences.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('AI response did not contain a JSON object');
  return JSON.parse(withoutFences.slice(start, end + 1)) as T;
}
