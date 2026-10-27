#!/usr/bin/env node
/** Generates docs/Sprints/jira-import.csv from the sprint scope tables. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const rows = [];
let index = 1;
for (let sprint = 1; sprint <= 5; sprint += 1) {
  const path = resolve(root, `docs/Sprints/sprint${sprint}/00-sprint.md`);
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((cell) => cell.trim());
    if (cells.length < 6) continue;
    const [, fr, summary, story, points] = cells;
    if (!/^FR-\d+$/.test(fr ?? '')) continue;
    if (!/^US-[\d.]+$/.test(story ?? '')) continue;
    if (!/^\d+$/.test(points ?? '')) continue;
    rows.push({
      key: `OSH-${index}`,
      summary: `${story} ${summary.replace(/\s+/g, ' ')}`,
      fr,
      story,
      sprint: `Sprint ${sprint}`,
      points,
    });
    index += 1;
  }
}
const header = ['Issue key', 'Summary', 'Issue Type', 'Epic Link', 'FR', 'Story', 'Sprint', 'Story Points', 'Labels'];
const csv = [header.join(',')];
for (const row of rows) {
  const values = [
    row.key,
    row.summary,
    'Story',
    row.fr,
    row.fr,
    row.story,
    row.sprint,
    row.points,
    `fr-${row.fr.replace('FR-', '')},sprint-${row.sprint.replace('Sprint ', '')}`,
  ].map((value) => `"${String(value).replaceAll('"', '""')}"`);
  csv.push(values.join(','));
}
const output = resolve(root, 'docs/Sprints/jira-import.csv');
writeFileSync(output, `${csv.join('\n')}\n`, 'utf8');
console.log(`Wrote ${rows.length} stories to ${output}`);
