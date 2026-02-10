const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MOGODB_CONNECTION || 'mongodb+srv://tonystark1592025_db_user:RKv5rr2Xf2t2qgvX@pumpgravity.4f1acnv.mongodb.net/?appName=pumpgravity';

async function fixArticleIds() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const articlesCollection = db.collection('articles');
    const newsCollection = db.collection('news');
    
    // Find all articles with invalid IDs (not 24 characters)
    const articles = await articlesCollection.find({}).toArray();
    console.log(`Found ${articles.length} articles`);
    
    let fixed = 0;
    let deleted = 0;
    
    for (const article of articles) {
      const idString = article._id.toString();
      console.log(`\nChecking article: ${article.title}`);
      console.log(`ID: ${idString} (length: ${idString.length})`);
      
      // Check if ID is valid MongoDB ObjectId (24 hex characters)
      if (idString.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(idString)) {
        console.log(`❌ Invalid ID detected!`);
        
        // Delete the article with invalid ID
        await articlesCollection.deleteOne({ _id: article._id });
        deleted++;
        console.log(`✅ Deleted article with invalid ID`);
      } else {
        console.log(`✓ Valid ID`);
        fixed++;
      }
    }
    
    // Do the same for news
    const news = await newsCollection.find({}).toArray();
    console.log(`\nFound ${news.length} news items`);
    
    for (const newsItem of news) {
      const idString = newsItem._id.toString();
      console.log(`\nChecking news: ${newsItem.title}`);
      console.log(`ID: ${idString} (length: ${idString.length})`);
      
      if (idString.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(idString)) {
        console.log(`❌ Invalid ID detected!`);
        await newsCollection.deleteOne({ _id: newsItem._id });
        deleted++;
        console.log(`✅ Deleted news with invalid ID`);
      } else {
        console.log(`✓ Valid ID`);
        fixed++;
      }
    }
    
    console.log('\n=== Summary ===');
    console.log(`Valid items: ${fixed}`);
    console.log(`Deleted items with invalid IDs: ${deleted}`);
    console.log('\nAll articles and news now have valid MongoDB ObjectIds!');
    console.log('You can now create new articles through the admin panel.');
    
  } catch (error) {
    console.error('Error fixing article IDs:', error);
  } finally {
    await mongoose.disconnect();
  }
}

fixArticleIds();