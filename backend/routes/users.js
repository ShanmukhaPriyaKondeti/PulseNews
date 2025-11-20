// backend/routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const db = require('../db');
require('dotenv').config();

// ------------------- REGISTER -------------------
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ msg: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        const payload = { user: { id: result.insertId } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.json({ token, user: { id: result.insertId, email, preferences: [] } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// ------------------- LOGIN -------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ msg: 'Invalid Credentials' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        // Fetch user preferences
        const [prefs] = await db.query('SELECT category FROM preferences WHERE user_id = ?', [user.id]);
        const categories = prefs.map(p => p.category);

        res.json({ token, user: { id: user.id, email: user.email, preferences: categories } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// ------------------- SAVE PREFERENCES -------------------
router.post('/preferences', auth, async (req, res) => {
    const { preferences } = req.body; // array
    try {
        await db.query('DELETE FROM preferences WHERE user_id = ?', [req.user.id]);
        for (const category of preferences) {
            await db.query('INSERT INTO preferences (user_id, category) VALUES (?, ?)', [req.user.id, category]);
        }
        res.json({ preferences });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// ------------------- GET CURRENT USER -------------------
router.get('/me', auth, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ msg: 'User not found' });

        const user = rows[0];
        const [prefs] = await db.query('SELECT category FROM preferences WHERE user_id = ?', [user.id]);
        const categories = prefs.map(p => p.category);

        res.json({ id: user.id, email: user.email, preferences: categories });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

module.exports = router;
