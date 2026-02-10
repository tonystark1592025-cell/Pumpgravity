const mongoose = require('mongoose');

const MONGODB_URI = process.env.MOGODB_CONNECTION || 'mongodb+srv://tonystark1592025_db_user:RKv5rr2Xf2t2qgvX@pumpgravity.4f1acnv.mongodb.net/?appName=pumpgravity';

async function clearDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully!');

    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log(`Found ${collections.length} collections`);
    
    for (const collection of collections) {
      console.log(`Dropping collection: ${collection.name}`);
      await mongoose.connection.db.dropCollection(collection.name);
    }
    
    console.log('✅ All collections cleared successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
}

clearDatabase();
