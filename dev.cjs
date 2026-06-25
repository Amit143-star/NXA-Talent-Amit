const { spawn } = require('child_process');

console.log("Starting NXA Sync Server...");
const server = spawn('node', ['server.cjs'], { stdio: 'inherit', shell: true });

console.log("Starting Vite Dev Server...");
const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });

process.on('SIGINT', () => {
  server.kill();
  vite.kill();
  process.exit();
});
