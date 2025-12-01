import mongoose from 'mongoose';

// MongoDB Connection String
const MONGODB_URI = "mongodb+srv://complexrp:complexrp@hipaaaaa.kjko0im.mongodb.net/complexrp?appName=Hipaaaaa";

// Connection Cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Limit connections
      serverSelectionTimeoutMS: 5000, // Fail fast if no connection
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

// Schema Definition
const updateSchema = new mongoose.Schema({
  id: String,
  title: String,
  subtitle: String,
  description: String,
  imageUrl: String,
  secondaryImage: String,
  tag: String,
  date: String,
  fullContent: String,
  rawBlocks: mongoose.Schema.Types.Mixed,
  isFeatured: Boolean,
  version: String
}, { strict: false });

const Update = mongoose.models.Update || mongoose.model('Update', updateSchema);

export default async function handler(request, response) {
  // Set CORS headers for robustness
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
    await connectToDatabase();

    // GET: Fetch all updates
    if (request.method === 'GET') {
      // .lean() is CRITICAL: It returns plain JS objects instead of Mongoose Docs.
      // This is much faster and uses less memory, preventing crashes with large data.
      const updates = await Update.find({}).sort({ _id: -1 }).lean(); 
      return response.status(200).json(updates);
    }

    // POST: Create or Update (Upsert based on ID)
    if (request.method === 'POST') {
      const data = request.body;
      const existing = await Update.findOne({ id: data.id });
      
      if (existing) {
          // Update existing
          Object.assign(existing, data);
          await existing.save();
          return response.status(200).json(existing);
      } else {
          // Create new
          const newUpdate = new Update(data);
          await newUpdate.save();
          return response.status(201).json(newUpdate);
      }
    }

    // PUT: Explicit Update
    if (request.method === 'PUT') {
        const data = request.body;
        const { id, ...updateData } = data;
        const updated = await Update.findOneAndUpdate({ id }, updateData, { new: true });
        return response.status(200).json(updated);
    }

    // DELETE: Remove update
    if (request.method === 'DELETE') {
      const { id } = request.query;
      
      if (!id) {
        return response.status(400).json({ error: 'ID param missing' });
      }

      // Try deleting by custom string 'id' first
      let result = await Update.deleteOne({ id: id });
      
      // If nothing was deleted, check if the ID provided is a valid MongoDB ObjectId 
      if (result.deletedCount === 0 && mongoose.Types.ObjectId.isValid(id)) {
         result = await Update.deleteOne({ _id: id });
      }

      return response.status(200).json({ success: true, deletedCount: result.deletedCount });
    }

    return response.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}