import express from "express";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

async function main() {
  // Create Express app
  const app = express();
  
  // Add JSON middleware
  app.use(express.json());
  
  // Register routes and get HTTP server
  const server = await registerRoutes(app);
  
  // For production, serve static files from the client/dist directory
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    // For development, set up Vite dev server
    await setupVite(app, server);
  }
  
  // Global error handler
  app.use((err, _req, res, _next) => {
    log(`Error: ${err.message}`, "error");
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  });
  
  // Start the server
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    log(`serving on port ${PORT}`);
  });
}

main().catch(error => {
  log(`Fatal error: ${error.message}`, "error");
  process.exit(1);
});