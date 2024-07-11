const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const dataset = require('./dataset.json');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'Allo Health';

app.use(cors());
app.use(bodyParser.json());

const users = [
    { username: '', password: '' }
];

// Generate random passengers array
const passengers = [
    { id: 1, name: 'John Doe', age: 30 },
    { id: 2, name: 'Jane Smith', age: 25 },
    { id: 3, name: 'Michael Johnson', age: 40 }
];

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        console.error('Token missing from request');
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Token successfully verified:', decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Invalid token:', err);
        res.status(401).json({ message: 'Invalid token' });
    }
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Received login attempt: username=${username}, password=${password}`);
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated successfully:', token);
        res.json({ token });
    } else {
        console.error('Invalid credentials');
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// Route to fetch all passengers (protected route)
app.get('/passengers', verifyToken, (req, res) => {
    res.json(passengers);
});

// Protected route - requires token for access
app.get('/dataset', verifyToken, (req, res) => {
    res.json(dataset);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
