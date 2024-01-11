const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Set up MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'mydatabase',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL database');
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Login API
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else if (results.length > 0) {
            req.session.userId = results[0].id; // Store user ID in the session
            res.status(200).json({ success: true, userId: results[0].id, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Form Data API
app.post('/formData', (req, res) => {
    const { title, description } = req.body;
    const userId = req.session.userId; // Retrieve user ID from the session

    if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }

    db.query('INSERT INTO formData (title, description, userId) VALUES (?, ?, ?)', [title, description, userId], (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Internal Server Error' });
        } else {
            res.status(201).json({ success: true, message: 'Form data saved successfully' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
