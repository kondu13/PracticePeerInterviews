// Start the client with Vite
import { createServer } from 'vite';
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function startClient() {
  console.log('Starting client development server...');
  
  const vite = await createServer({
    root: path.resolve(__dirname, 'client'),
    server: {
      port: 5173,
      host: '0.0.0.0',
    },
    configFile: false,
    publicDir: path.resolve(__dirname, 'client/public'),
    clearScreen: false,
  });
  
  await vite.listen();
  
  console.log(`Client development server running at http://localhost:5173`);
}

startClient().catch(err => {
  console.error('Error starting client:', err);
  process.exit(1);
});