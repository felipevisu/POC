import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const MODELS = ['haiku', 'sonnet', 'opus'];

export function parseArgs(argv) {
  const args = [...argv];
  const cache = args.includes('--enable-cache');
  const promptfooArgs = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--enable-cache') continue;
    if (a === '--providers' || a.startsWith('--providers=')) {
      const list = a.includes('=') ? a.slice(a.indexOf('=') + 1) : args[++i];
      const names = (list ?? '').split(',').map((n) => n.trim()).filter(Boolean);
      const unknown = names.filter((n) => !MODELS.includes(n));
      if (!names.length || unknown.length) throw new Error(`--providers takes model names: ${MODELS.join(', ')} (e.g. --providers sonnet)`);
      promptfooArgs.push('--filter-providers', `^(${names.join('|')})(\\+jev)?$`);
      continue;
    }
    promptfooArgs.push(a);
  }
  return { cache, promptfooArgs };
}

export function runFile(date, cache) {
  const stamp = date.toISOString().slice(0, 19).replace('T', '_').replaceAll(':', '-');
  return `eval/runs/${stamp}${cache ? '_cache' : ''}.json`;
}

if (import.meta.main) {
  const { cache, promptfooArgs } = parseArgs(process.argv.slice(2));
  const out = runFile(new Date(Date.now() - new Date().getTimezoneOffset() * 60000), cache);
  mkdirSync('eval/runs', { recursive: true });
  if (cache) console.log('prompt cache: on');
  const env = { ...process.env, EVAL_CACHE: cache ? 'on' : 'off' };
  const pf = spawnSync('node_modules/.bin/promptfoo', ['eval', '-c', 'eval/promptfooconfig.yaml', '--no-cache', '-o', out, ...promptfooArgs], { stdio: 'inherit', env });
  spawnSync(process.execPath, ['eval/summary.js', out], { stdio: 'inherit' });
  process.exit(pf.status ?? 1);
}
