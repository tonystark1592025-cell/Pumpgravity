const { database } = require('../lib/database.ts')

async function seedDatabase() {
  try {
    console.log('Initializing database...')
    await database.init()
    
    console.log('Database initialized successfully!')
    console.log('Sample article created.')
    
    // Get all articles to verify
    const articles = await database.getArticles()
    console.log(`Total articles in database: ${articles.length}`)
    
    articles.forEach(article => {
      console.log(`- ${article.title} (${article.slug})`)
    })
    
  } catch (error) {
    console.error('Error seeding database:', error)
  }
}

seedDatabase()