// PostToolUse fast-feedback hook: eslint --fix + scoped incremental tsc on the touched .ts/.tsx file.
// Runs async (never blocks the tool call) and always exits 0. Reports remaining issues via systemMessage.
// Invokes the eslint/tsc JS entry points directly with the running node binary to skip .cmd-shim
// and yarn/npx wrapper startup overhead, which otherwise roughly doubles the wall time on Windows.
const { spawnSync } = require('node:child_process');
const path = require('node:path');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (input += chunk));
process.stdin.on('end', () => {
  let file;
  try {
    const payload = JSON.parse(input || '{}');
    file = payload.tool_input && payload.tool_input.file_path;
  } catch {
    process.exit(0);
  }

  if (!file || !/\.(ts|tsx)$/.test(file)) process.exit(0);

  const root = path.resolve(__dirname, '..', '..');
  const spawnOpts = { cwd: root, encoding: 'utf8' };
  const eslintBin = path.join(root, 'node_modules', 'eslint', 'bin', 'eslint.js');
  const tscBin = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');

  const eslint = spawnSync(process.execPath, [eslintBin, '--fix', file], spawnOpts);
  const tsc = spawnSync(
    process.execPath,
    [tscBin, '--noEmit', '--incremental', '--tsBuildInfoFile', '.claude/.tsc-hook-cache', '-p', 'tsconfig.app.json'],
    spawnOpts
  );

  let out = '';
  if (eslint.status !== 0) out += `eslint (${file}):\n${eslint.stdout || ''}${eslint.stderr || ''}\n`;
  if (tsc.status !== 0) out += `tsc:\n${tsc.stdout || ''}${tsc.stderr || ''}\n`;

  if (out) {
    process.stdout.write(JSON.stringify({ systemMessage: out.slice(0, 3500) }));
  }
  process.exit(0);
});
