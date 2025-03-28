// Start script for development using TypeScript
import { exec } from 'child_process';

console.log('Starting development server with TypeScript...');
const devProcess = exec('tsx server/index.ts');

devProcess.stdout.on('data', (data) => {
  console.log(data);
});

devProcess.stderr.on('data', (data) => {
  console.error(data);
});

devProcess.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
});