import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

// Strict URI check.
const isValidUri = uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://');

if (!isValidUri) {
  if (uri && uri !== 'your-mongodb-connection-string') {
    console.warn('⚠️ Invalid MongoDB URI format. AI logging will be disabled.');
  } else {
    console.warn('⚠️ MongoDB URI not configured. AI logging will be disabled.');
  }
  clientPromise = Promise.reject('Invalid or missing MongoDB URI');
} else {
  if (process.env.NODE_ENV === 'development') {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;
