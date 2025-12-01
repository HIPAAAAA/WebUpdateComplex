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
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
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
  try {
    await connectToDatabase();

    // GET: Fetch all updates
    if (request.method === 'GET') {
      // Just fetch what is there. If empty, return empty array.
      const updates = await Update.find({}).sort({ _id: -1 }); 
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
      // and try deleting by _id (fallback mechanism)
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