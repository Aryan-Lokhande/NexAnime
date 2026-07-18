const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVER_URL = process.env.ML_SERVER_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

let datasetPromise = null;
function ensureDatasetLoaded() {
  if (!datasetPromise) {
    datasetPromise = loadDataset();
  }
  return datasetPromise;
}

app.get('/', (req, res) => {
  res.send('NexAnime Backend Server is running fine.');
});

// Middleware to ensure the dataset is loaded before serving any requests
app.use(async (req, res, next) => {
  try {
    await ensureDatasetLoaded();
    next();
  } catch (err) {
    console.error('Dataset load middleware error:', err);
    res.status(500).json({ error: 'Failed to initialize dataset: ' + err.message });
  }
});

let animes = [];
const animeMap = new Map();

// Helper function to load and parse CSV
function loadDataset() {
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, 'Animeslist.csv');
    console.log(`Parsing dataset from ${csvPath}...`);
    
    if (!fs.existsSync(csvPath)) {
      return reject(new Error(`CSV dataset file not found at ${csvPath}`));
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse numerical columns
        const animeId = parseInt(row['anime_id'], 10);
        if (!isNaN(animeId)) {
          const item = {
            anime_id: animeId,
            Name: row['Name'] || '',
            English_name: row['English name'] || 'UNKNOWN',
            Image_URL: row['Image URL'] || 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png',
            Score: parseFloat(row['Score']) || 0.0,
            Aired: row['Aired'] || 'UNKNOWN',
            Type: row['Type'] || 'UNKNOWN',
            Rating: row['Rating'] || 'UNKNOWN',
            Studio: row['Studio'] || 'UNKNOWN',
            Genres: row['Genres'] || 'UNKNOWN',
            Synopsis: row['Synopsis'] || 'UNKNOWN',
            Source: row['Source'] || 'UNKNOWN',
            Members: parseInt(row['Members'], 10) || 0,
            Favorites: parseInt(row['Favorites'], 10) || 0,
            Rank: row['Rank'] || 'UNKNOWN',
            Popularity: row['Popularity'] || 'UNKNOWN',
            Scored_By: parseInt(row['Scored By'], 10) || 0
          };
          animes.push(item);
          animeMap.set(animeId, item);
        }
      })
      .on('end', () => {
        console.log(`Successfully loaded ${animes.length} anime records.`);
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', loadedCount: animes.length });
});

// 2. Get list of all animes (with filters and pagination)
app.get('/api/animes', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const genre = req.query.genre || 'All';
  const rating = req.query.rating || 'All';
  const type = req.query.type || 'All';
  const source = req.query.source || 'All';

  let filtered = animes;

  if (rating !== 'All') {
    filtered = filtered.filter(a => a.Rating === rating);
  }
  if (type !== 'All') {
    filtered = filtered.filter(a => a.Type === type);
  }
  if (source !== 'All') {
    filtered = filtered.filter(a => a.Source === source);
  }
  if (genre !== 'All') {
    const genreLower = genre.toLowerCase();
    filtered = filtered.filter(a => a.Genres.toLowerCase().includes(genreLower));
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = filtered.length;
  const data = filtered.slice(startIndex, endIndex);

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    data
  });
});

// 3. Autocomplete / Search recommendations
app.get('/api/animes/search', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    return res.json([]);
  }

  // Filter and find top 15 matches for quick autocomplete/results
  const matches = [];
  for (let i = 0; i < animes.length; i++) {
    const a = animes[i];
    const nameMatch = a.Name.toLowerCase().includes(query);
    const engNameMatch = a.English_name.toLowerCase().includes(query);
    
    if (nameMatch || engNameMatch) {
      matches.push(a);
      if (matches.length >= 15) break; // Limit search suggestions to 15 items
    }
  }

  res.json(matches);
});

// 4. Get detailed anime info
app.get('/api/animes/:id', (req, res) => {
  const animeId = parseInt(req.params.id, 10);
  if (isNaN(animeId)) {
    return res.status(400).json({ error: 'Invalid anime ID' });
  }

  const item = animeMap.get(animeId);
  if (!item) {
    return res.status(404).json({ error: 'Anime not found' });
  }

  res.json(item);
});

// 5. Popular recommendations (for Home Page: top, recent, classic)
app.get('/api/recommendations/popular', async (req, res) => {
  const { genre, rating, type, source, rec_type, limit } = req.query;
  
  try {
    // Call the ML server
    const response = await axios.post(`${ML_SERVER_URL}/recommend/popular`, {
      genres: genre || 'All',
      rating: rating || 'All',
      type: type || 'All',
      source: source || 'All',
      rec_type: rec_type || 'top',
      limit: parseInt(limit, 10) || 20,
      used_ids: []
    });

    const recommendedIds = response.data.anime_ids || [];
    
    // Map IDs to detailed anime objects from our local loaded list
    const results = recommendedIds
      .map(id => animeMap.get(id))
      .filter(Boolean); // filter out any null/undefined entries

    res.json(results);
  } catch (error) {
    console.error('Error fetching popular recommendations from ML server:', error.message);
    res.status(500).json({ error: 'Failed to retrieve recommendations from ML server' });
  }
});

// 6. Hybrid recommendations (for Search / Detail Page: "Watch these next")
app.get('/api/recommendations/hybrid/:id', async (req, res) => {
  const animeId = parseInt(req.params.id, 10);
  const limit = parseInt(req.query.limit, 10) || 20;

  if (isNaN(animeId)) {
    return res.status(400).json({ error: 'Invalid anime ID' });
  }

  try {
    // Call the ML server
    const response = await axios.post(`${ML_SERVER_URL}/recommend/hybrid`, {
      anime_id: animeId,
      limit: limit,
      content_weight: 0.8, // Configured identically to pages.py (0.8 content, 0.2 colab)
      colab_weight: 0.2
    });

    const recommendedIds = response.data.anime_ids || [];

    // Map IDs to detailed anime objects
    const results = recommendedIds
      .map(id => animeMap.get(id))
      .filter(Boolean);

    res.json(results);
  } catch (error) {
    console.error('Error fetching hybrid recommendations from ML server:', error.message);
    res.status(500).json({ error: 'Failed to retrieve recommendations from ML server' });
  }
});

// Export the app for serverless environments (like Vercel)
module.exports = app;

// Only listen if run directly (local development)
if (require.main === module) {
  ensureDatasetLoaded()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Backend server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to load dataset:', err);
      process.exit(1);
    });
} else {
  // Start loading dataset in the background for serverless execution
  ensureDatasetLoaded().catch((err) => {
    console.error('Background dataset load failed:', err);
  });
}
