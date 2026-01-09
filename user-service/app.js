const express = require('express');
const app = express();

app.use(express.json()); // Wajib untuk menerima JSON

// Dummy data
const users = [
  { id: 1, name: "Alice", email: "alice@example.com", role: "customer" },
  { id: 2, name: "Bob", email: "bob@example.com", role: "seller" },
  { id: 3, name: "Charlie", email: "charlie@example.com", role: "admin" }
];

// GET semua user
app.get('/users', (req, res) => {
    res.json(users);
});

// GET detail user
app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(p => p.id === userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).send('User not found');
    }
});

// POST tambah user
app.post('/users', (req, res) => {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
        return res.status(400).json({ message: "Semua field harus diisi" });
    }

    const newUser = {
        id: users.length + 1,
        name,
        email,
        role
    };

    users.push(newUser);

    res.status(201).json({
        message: "User berhasil ditambahkan",
        user: newUser
    });
});

// Run server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`User service is running on port ${PORT}`);
});
