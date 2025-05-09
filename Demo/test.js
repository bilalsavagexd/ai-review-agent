// Insecure Node.js + Express example
const express = require('express');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));

// Insecure: Hardcoded credentials
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',  // ❌ Hardcoded password
  database: 'users_db'
});

db.connect();

// Insecure: No input validation, SQL Injection vulnerability
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // ❌ Directly injecting user input into SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send('Server error');
    } else if (result.length > 0) {
      res.send('Login successful!');
    } else {
      res.send('Invalid credentials');
    }
  });
});

// Insecure: Exposing internal server info
app.get('/debug', (req, res) => {
  // ❌ Potentially sensitive data exposed
  res.send({
    environment: process.env,
    dbStatus: db.state
  });
});

// Insecure: Using outdated crypto (MD5) for password hashing
const crypto = require('crypto');
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // ❌ Insecure hash
  const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

  const query = `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`;
  db.query(query, (err) => {
    if (err) res.status(500).send('Registration error');
    else res.send('User registered');
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
