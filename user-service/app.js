const express = require('express');
const app = express();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); // Import bcrypt

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// --- INIT DATABASE (Jalankan sekali saat start) ---
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'customer'
      );
    `);
    console.log("Tabel Users siap.");
  } catch (err) {
    console.error("Gagal init DB:", err);
  }
};

// Tunggu koneksi DB lalu init tabel
pool.connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
    initDb();
  })
  .catch(err => console.error("DB connection failed:", err));


// --- ROUTES ---

// 1. REGISTER (Buat User Baru)
app.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Nama, Email, dan Password harus diisi" });
  }

  try {
    // Cek apakah email sudah ada
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke DB
    const result = await pool.query(
      'INSERT INTO users(name, email, password, role) VALUES($1,$2,$3,$4) RETURNING id, name, email, role',
      [name, email, hashedPassword, role || 'customer']
    );

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 2. LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cari user berdasarkan email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    const user = result.rows[0];

    // Bandingkan password input dengan password di DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah" });
    }

    // Login sukses
    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET semua user (Opsional, buat debug)
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`User service running on port ${PORT}`);
});