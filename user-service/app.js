const express = require('express');
const app = express();
const { Pool } = require('pg');

app.use(express.json()); // Wajib untuk menerima JSON


const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});


// Dummy data
// const users = [
//   { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
//   { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
//   { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
// ];

// GET semua user
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});


// GET detail user
app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});


// POST buat user baru
app.post('/users', async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: "Semua field harus diisi" });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users(name, email, role) VALUES($1,$2,$3) RETURNING *',
      [name, email, role]
    );

    res.status(201).json({
      message: "User berhasil ditambahkan",
      user: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING *',
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

app.put('/users/:id', async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2, role=$3 WHERE id=$4 RETURNING *',
      [name, email, role, req.params.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User updated', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});


pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("DB connection failed:", err));


// Run server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});
