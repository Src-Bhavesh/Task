const fs = require('fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/movieModel');

dotenv.config();

// Connect to MongoDB
mongoose.connect("mongodb+srv://bhaveshpandey:webdevproject@cluster0.wz63xid.mongodb.net/User")
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const results = [];
let count = 0;
const MAX_MOVIES = 50;

// Parse Python-style stringified list of dicts to JS array of objects
function parseStringifiedArray(str) {
  try {
    // TMDB dataset uses Python str representation, so we evaluate it safely
    // Replace "None" with "null" before evaluating
    const safeStr = str.replace(/None/g, 'null');
    const fn = new Function("return " + safeStr);
    return fn();
  } catch (error) {
    console.error("Error parsing stringified array:", error.message);
    return [];
  }
}

fs.createReadStream('credits.csv')
  .pipe(csv())
  .on('data', (data) => {
    if (count < MAX_MOVIES) {
      results.push(data);
      count++;
    }
  })
  .on('end', async () => {
    console.log(`Parsed ${results.length} movies from CSV.`);
    
    try {
      // Clear existing movies to prevent duplicates
      await Movie.deleteMany({});
      
      for (const row of results) {
        const castData = parseStringifiedArray(row.cast);
        const crewData = parseStringifiedArray(row.crew);
        
        // Take top 3 cast members
        const topCast = castData.slice(0, 3).map(actor => ({
          name: actor.name,
          character: actor.character,
          profile_path: actor.profile_path
        }));
        
        // Find director
        const director = crewData.find(c => c.job === 'Director');
        const crew = director ? [{ name: director.name, job: director.job, department: director.department }] : [];

        // Generate dummy title based on ID since credits.csv lacks title
        const dummyTitle = `Movie #${row.id}`;
        
        await Movie.create({
          tmdbId: row.id,
          title: dummyTitle,
          cast: topCast,
          crew: crew
        });
        console.log(`Added ${dummyTitle}`);
      }
      
      console.log('Seeding complete!');
      process.exit(0);
    } catch (error) {
      console.error('Seeding error:', error);
      process.exit(1);
    }
  });
