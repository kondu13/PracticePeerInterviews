import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;

export async function startMongoMemoryServer() {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set the MongoDB URI environment variable
  process.env.MONGODB_URI = mongoUri;
  
  console.log(`MongoDB Memory Server running at ${mongoUri}`);
  return mongoUri;
}

export async function stopMongoMemoryServer() {
  if (mongoServer) {
    await mongoServer.stop();
    console.log('MongoDB Memory Server stopped');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  await stopMongoMemoryServer();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await stopMongoMemoryServer();
  process.exit(0);
});