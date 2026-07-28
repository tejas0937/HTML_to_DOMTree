const { spawn } = require('child_process');

function run(command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      process.exit(code || 1);
    }
  });

  return child;
}

const server = run('npm', ['run', 'dev', '--workspace', 'server'], process.cwd());
const client = run('npm', ['run', 'dev', '--workspace', 'client'], process.cwd());

server.on('exit', () => client.kill());
client.on('exit', () => server.kill());
