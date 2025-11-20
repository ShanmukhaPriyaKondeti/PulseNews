// backend/routes/news.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const auth = require('../middleware/auth');
const db = require('../db');
require('dotenv').config();

router.get('/', auth, async (req, res) => {
    try {
        // Fetch user preferences
        const [prefs] = await db.query(
            'SELECT category FROM preferences WHERE user_id = ?',
            [req.user.id]
        );

        if (!prefs || prefs.length === 0) {
            return res.status(200).json({ articles: [], msg: 'Please select your news preferences first.' });
        }

        const query = prefs.map(p => p.category).join(' OR ');

        // GNews API
        const apiKey = process.env.GNEWS_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ articles: [], msg: 'Server error: GNews API key not configured.' });
        }

        const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=20&apikey=${apiKey}`;

        const response = await axios.get(url);

        // If API returns empty results
        if (!response.data || !response.data.articles || response.data.articles.length === 0) {
            return res.status(200).json({ articles: [], msg: 'No news found for your selected categories.' });
        }

        // Successful response
        res.json({ articles: response.data.articles });

    } catch (err) {
        console.error('GNews Error:', err.response?.data || err.message);
        res.status(500).json({ articles: [], msg: 'Could not fetch news at this time. Please try again later.' });
    }
});

module.exports = router;
